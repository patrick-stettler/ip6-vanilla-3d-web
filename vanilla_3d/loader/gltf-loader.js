import {createObject3d} from "../objects/object-3d/object-3d.js";
import {createTriangleFace} from "../objects/triangle-face/triangle-face.js";

export {
    createMeshFromGLTF
}

/**
 * glTF constants
 */
const TYPE_COMPONENTS = Object.freeze({SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4});

const COMPONENT = Object.freeze({
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
});

const COMPONENT_BYTES = Object.freeze({
    [COMPONENT.BYTE]: 1,
    [COMPONENT.UNSIGNED_BYTE]: 1,
    [COMPONENT.SHORT]: 2,
    [COMPONENT.UNSIGNED_SHORT]: 2,
    [COMPONENT.UNSIGNED_INT]: 4,
    [COMPONENT.FLOAT]: 4,
});

const TYPED_ARRAY_CTOR = Object.freeze({
    [COMPONENT.FLOAT]: Float32Array,
    [COMPONENT.UNSIGNED_SHORT]: Uint16Array,
    [COMPONENT.UNSIGNED_INT]: Uint32Array,
    [COMPONENT.UNSIGNED_BYTE]: Uint8Array,
    [COMPONENT.BYTE]: Int8Array,
    [COMPONENT.SHORT]: Int16Array,
});

const clamp01 = v => Math.max(0, Math.min(1, v ?? 0));

/**
 * Math helpers (column-major, glTF style)
 */
const mat4Identity = () =>
    new Float32Array([1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);

const mat4Mul = (a, b) => {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 4; r++) {
            out[c * 4 + r] =
                a[0 * 4 + r] * b[c * 4 + 0] +
                a[1 * 4 + r] * b[c * 4 + 1] +
                a[2 * 4 + r] * b[c * 4 + 2] +
                a[3 * 4 + r] * b[c * 4 + 3];
        }
    }
    return out;
};

const transformPoint = (m, x, y, z) => ({
    x: m[0] * x + m[4] * y + m[8] * z + m[12],
    y: m[1] * x + m[5] * y + m[9] * z + m[13],
    z: m[2] * x + m[6] * y + m[10] * z + m[14],
});

/**
 * glTF loading
 */
const loadGltf = async url => {
    const gltfRes = await fetch(url);
    if (!gltfRes.ok) throw new Error("Failed to load glTF");
    const gltf = await gltfRes.json();

    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

    const buffers = await Promise.all(
        (gltf.buffers ?? []).map(async b => {
            const res = await fetch(baseUrl + b.uri);
            if (!res.ok) throw new Error(`Failed to load buffer ${b.uri}`);
            return res.arrayBuffer();
        })
    );

    return {gltf, buffers};
};

/**
 * Accessor reading
 * Supports packed and interleaved bufferViews
 */
const readAccessor = ({buffer, bufferView, accessor}) => {
    const comps = TYPE_COMPONENTS[accessor.type];
    if (!comps) throw new Error(`Unsupported accessor type: ${accessor.type}`);

    const bytesPerComp = COMPONENT_BYTES[accessor.componentType];
    if (!bytesPerComp) throw new Error(`Unsupported componentType: ${accessor.componentType}`);

    const Ctor = TYPED_ARRAY_CTOR[accessor.componentType];
    if (!Ctor) throw new Error(`No TypedArray for componentType: ${accessor.componentType}`);

    const elemBytes = comps * bytesPerComp;
    const stride = bufferView.byteStride ?? 0;

    const baseOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);

    // tightly packed
    if (!stride || stride === elemBytes) {
        return new Ctor(buffer, baseOffset, accessor.count * comps);
    }

    // interleaved, use DataView and copy out
    const out = new Ctor(accessor.count * comps);
    const view = new DataView(buffer, bufferView.byteOffset ?? 0);
    const little = true;
    const relAccessorOffset = accessor.byteOffset ?? 0;

    const readScalar = makeInterleavedScalarReader(view, accessor.componentType, little);

    for (let i = 0; i < accessor.count; i++) {
        const base = i * stride + relAccessorOffset;
        const outBase = i * comps;
        for (let c = 0; c < comps; c++) {
            out[outBase + c] = readScalar(base + c * bytesPerComp);
        }
    }

    return out;
};

const makeInterleavedScalarReader = (view, componentType, little) => {
    switch (componentType) {
        case COMPONENT.FLOAT:
            return b => view.getFloat32(b, little);
        case COMPONENT.UNSIGNED_SHORT:
            return b => view.getUint16(b, little);
        case COMPONENT.UNSIGNED_INT:
            return b => view.getUint32(b, little);
        case COMPONENT.UNSIGNED_BYTE:
            return b => view.getUint8(b);
        case COMPONENT.BYTE:
            return b => view.getInt8(b);
        case COMPONENT.SHORT:
            return b => view.getInt16(b, little);
        default:
            throw new Error(`Interleaved read not implemented for ${componentType}`);
    }
};

/**
 * glTF data access helpers
 */
const getAccessorPack = (gltf, buffers, accessorIndex) => {
    if (accessorIndex == null) return null;

    const accessor = gltf.accessors?.[accessorIndex];
    if (!accessor) return null;

    const bufferView = gltf.bufferViews?.[accessor.bufferView];
    if (!bufferView) return null;

    const buffer = buffers?.[bufferView.buffer];
    if (!buffer) return null;

    const data = readAccessor({buffer, bufferView, accessor});
    return {data, accessor, bufferView};
};

const getPrimAttribute = (gltf, buffers, prim, name) =>
    getAccessorPack(gltf, buffers, prim.attributes?.[name]);

const getPrimIndices = (gltf, buffers, prim) =>
    getAccessorPack(gltf, buffers, prim.indices);

/**
 * Material + vertex color pipeline
 */
const getPrimitiveMaterialInfo = (gltf, prim) => {
    const mat = prim.material != null ? gltf.materials?.[prim.material] : null;

    const baseColorFactor =
        mat?.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];

    const alphaMode = mat?.alphaMode ?? "OPAQUE";
    const alphaCutoff = mat?.alphaCutoff ?? 0.5;
    const doubleSided = !!mat?.doubleSided;

    return {baseColorFactor, alphaMode, alphaCutoff, doubleSided};
};

const vec4FromFactor = f => ({x: f[0], y: f[1], z: f[2], w: f[3]});

const mulColor = (a, b) => ({
    x: (a.x ?? 1) * (b.x ?? 1),
    y: (a.y ?? 1) * (b.y ?? 1),
    z: (a.z ?? 1) * (b.z ?? 1),
    w: (a.w ?? 1) * (b.w ?? 1),
});

const avg3vec4 = (a, b, c) => ({
    x: (a.x + b.x + c.x) / 3,
    y: (a.y + b.y + c.y) / 3,
    z: (a.z + b.z + c.z) / 3,
    w: (a.w + b.w + c.w) / 3,
});

const applyAlphaMode = (alphaMode, alphaCutoff, alpha) => {
    if (alphaMode === "OPAQUE") return 1;
    if (alphaMode === "BLEND") return alpha;
    if (alphaMode === "MASK") return alpha >= alphaCutoff ? 1 : 0;
    return alpha;
};

const rgbaCssFromVec4_01 = v => {
    const r = Math.round(clamp01(v.x) * 255);
    const g = Math.round(clamp01(v.y) * 255);
    const b = Math.round(clamp01(v.z) * 255);
    const a = clamp01(v.w ?? 1);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const readVertexColor01 = (colorsData, accessor, vertexIndex) => {
    const comps = TYPE_COMPONENTS[accessor.type]; // 3 or 4
    const base = vertexIndex * comps;

    let r = colorsData[base + 0];
    let g = colorsData[base + 1];
    let b = colorsData[base + 2];
    let a = comps === 4 ? colorsData[base + 3] : 1;

    if (accessor.normalized) {
        const max =
            accessor.componentType === COMPONENT.UNSIGNED_BYTE ? 255 :
                accessor.componentType === COMPONENT.UNSIGNED_SHORT ? 65535 :
                    1;

        r /= max;
        g /= max;
        b /= max;
        a /= max;
    }

    return {x: r, y: g, z: b, w: a};
};

/**
 * Loads a glTF mesh from a given URL and converts it into an Object3D
 * composed of individual triangle faces.
 *
 * All meshes are decomposed into individual triangle faces.
 *
 * Only geometric data is used:
 * - vertex positions
 * - triangle indices
 *
 * Normals, UVs, materials and textures are intentionally ignored.
 * The glTF file may reference additional buffers (.bin), which are
 * resolved and loaded internally.
 *
 * Each triangle is converted into its own TriangleFace object and
 * attached to a common root Object3D.
 *
 * @param {string} url  Path to the .gltf file
 * @param {Object3DConfigType | undefined} config
 * @returns {Promise<Object3DType>} Root Object3D containing all triangle faces
 */
const createMeshFromGLTF = async (url, config = {}) => {
    const {gltf, buffers} = await loadGltf(url);

    const root = createObject3d(config);
    root.element.classList.add("gltf-scene");

    const sceneIndex = gltf.scene ?? 0;
    const scene = gltf.scenes?.[sceneIndex];
    if (!scene) throw new Error("No scene in glTF");

    let faceCount = 0;

    const visitNode = (nodeIndex, parentMat) => {
        const node = gltf.nodes?.[nodeIndex];
        if (!node) return;

        const nodeMat = node.matrix ? new Float32Array(node.matrix) : mat4Identity();
        const worldMat = mat4Mul(parentMat, nodeMat);

        if (node.mesh != null) {
            const mesh = gltf.meshes?.[node.mesh];
            const prims = mesh?.primitives ?? [];

            for (const prim of prims) {
                const mode = prim.mode ?? 4; // TRIANGLES
                if (mode !== 4) continue;

                const posPack = getPrimAttribute(gltf, buffers, prim, "POSITION");
                const idxPack = getPrimIndices(gltf, buffers, prim);
                if (!posPack || !idxPack) continue;

                const positions = posPack.data;
                const indices = idxPack.data;

                const {baseColorFactor, alphaMode, alphaCutoff, doubleSided} =
                    getPrimitiveMaterialInfo(gltf, prim);

                const base = vec4FromFactor(baseColorFactor);

                const colorPack = getPrimAttribute(gltf, buffers, prim, "COLOR_0");
                const colors0 = colorPack?.data ?? null;
                const colorsAcc = colorPack?.accessor ?? null;

                const colorAt = vi => {
                    if (!colors0 || !colorsAcc) return null;
                    return readVertexColor01(colors0, colorsAcc, vi);
                };

                faceCount += indices.length / 3;

                // Hot loop, avoid vec3At allocations, read positions by index directly
                for (let t = 0; t < indices.length; t += 3) {
                    const i1 = indices[t];
                    const i2 = indices[t + 1];
                    const i3 = indices[t + 2];

                    const p1 = transformPoint(
                        worldMat,
                        positions[i1 * 3],
                        positions[i1 * 3 + 1],
                        positions[i1 * 3 + 2]
                    );
                    const p2 = transformPoint(
                        worldMat,
                        positions[i2 * 3],
                        positions[i2 * 3 + 1],
                        positions[i2 * 3 + 2]
                    );
                    const p3 = transformPoint(
                        worldMat,
                        positions[i3 * 3],
                        positions[i3 * 3 + 1],
                        positions[i3 * 3 + 2]
                    );

                    const face = createTriangleFace({p1, p2, p3});

                    let final = base;
                    const c1 = colorAt(i1);
                    const c2 = colorAt(i2);
                    const c3 = colorAt(i3);
                    if (c1 && c2 && c3) final = mulColor(base, avg3vec4(c1, c2, c3));

                    const css = rgbaCssFromVec4_01(final);
                    const outAlpha = applyAlphaMode(alphaMode, alphaCutoff, clamp01(final.w));

                    face.element.style.setProperty("--base-color", css);
                    face.element.style.setProperty("--base-transparency", String(outAlpha));
                    face.element.style.backfaceVisibility = doubleSided ? "visible" : "hidden";

                    root.addObject(face);
                }
            }
        }

        for (const c of node.children ?? []) visitNode(c, worldMat);
    };

    const sceneRootMat = mat4Identity();
    for (const n of scene.nodes ?? []) visitNode(n, sceneRootMat);

    console.log("faces:", faceCount);
    return root;
};
