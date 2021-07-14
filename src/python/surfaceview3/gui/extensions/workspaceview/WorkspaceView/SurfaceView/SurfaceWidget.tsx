import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AffineTransformation3D, Slice, Vector3 } from '../SlicesView/mainLayer';
import { SurfaceViewOptions } from './Controls';
import { SurfaceData } from './SurfaceView';

type Props = {
    surfaceData: SurfaceData
    currentSlice?: Slice
    width: number
    height: number
    options: SurfaceViewOptions
}

const stats = (x: number[]) => {
    if (!x.length) return {mean: 0, min: 0, max: 0}
    const sum = x.reduce((previous, current) => current += previous, 0)
    const min = Math.min(...x)
    const max = Math.max(...x)
    const mean = sum / x.length
    return {mean, min, max}
}

const getMeshScaleFactor = (surfaceData: SurfaceData) => {
    // seems to be a problem if we don't divide by a large number ???
    const {mean: xAbsMean} =  stats(surfaceData.vertices.map(v => (Math.abs(v[0]))))
    const {mean: yAbsMean} =  stats(surfaceData.vertices.map(v => (Math.abs(v[1]))))
    const {mean: zAbsMean} =  stats(surfaceData.vertices.map(v => (Math.abs(v[2]))))
    const scaleFactor = 100 / ((xAbsMean + yAbsMean + zAbsMean) / 3)

    return scaleFactor
}

const getMeshGeometry = (surfaceData: SurfaceData, scaleFactor: number) => {
    const geometry = new THREE.BufferGeometry();

    const indices: number[] = [];

    const vertices = [];
    const normals = [];
    const colors = [];

    const x = surfaceData.vertices.map(v => (v[0] * scaleFactor))
    const y = surfaceData.vertices.map(v => (v[1] * scaleFactor))
    const z = surfaceData.vertices.map(v => (v[2] * scaleFactor))
    const {min: xmin, max: xmax} = stats(x)
    const {min: ymin, max: ymax} = stats(y)
    // const {min: zmin, max: zmax} = stats(z)

    for (let i = 0; i < x.length; i++) {
        // vertices.push(2 * (x[i] - xmin) / (xmax - xmin) - 1, 2 * (y[i] - ymin) / (ymax - ymin) - 1, 2 * (z[i] - zmin) / (zmax - zmin) - 1)
        vertices.push(x[i], y[i], z[i])
        normals.push(0, 0, 1)
        const r = ( x[i] - xmin ) / (xmax - xmin)
        const g = ( y[i] - ymin ) / (ymax - ymin)
        colors.push(r, g, 1)
    }

    for (let j = 0; j < surfaceData.ifaces.length; j++) {
        const a = surfaceData.ifaces[j]
        const b =(j + 1 < surfaceData.ifaces.length) ? surfaceData.ifaces[j + 1] : x.length + 1
        for (let k = 3; k <= b - a; k++) {
            indices.push(surfaceData.faces[a], surfaceData.faces[a + k - 2], surfaceData.faces[a + k - 1])
        }
    }

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    return geometry
}

const transformPoint = (A: AffineTransformation3D, p: Vector3) => {
    return [
        A[0][0] * p[0] + A[0][1] * p[1] + A[0][2] * p[2] + A[0][3],
        A[1][0] * p[0] + A[1][1] * p[1] + A[1][2] * p[2] + A[1][3],
        A[2][0] * p[0] + A[2][1] * p[1] + A[2][2] * p[2] + A[2][3]
    ] as any as Vector3
}


const SurfaceWidget: FunctionComponent<Props> = ({surfaceData, width, height, options, currentSlice}) => {
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [scene, setScene] = useState<THREE.Scene | null>(null)

    useEffect(() => {
        const scene = new THREE.Scene()
        scene.background = new THREE.Color( 0xffffff );

        setScene(scene)
    }, [])

    const {mesh2, scaleFactor} = useMemo(() => {
        const material = new THREE.MeshPhongMaterial( {
            side: THREE.DoubleSide,
            vertexColors: true
        })
        const scaleFactor = getMeshScaleFactor(surfaceData)
        const meshGeometry = getMeshGeometry(surfaceData, scaleFactor)
        return {
            mesh2: new THREE.Mesh( meshGeometry, material ),
            scaleFactor
        }
    }, [surfaceData])

    const bbox = useMemo(() => {
        return new THREE.Box3().setFromObject(mesh2)
    }, [mesh2])

    const {camera, controls} = useMemo(() => {
        if (!container) return {camera: undefined, controls: undefined}
        const p = {x: (bbox.min.x + bbox.max.x) / 2, y: (bbox.min.y + bbox.max.y) / 2, z: (bbox.min.z + bbox.max.z) / 2}
        const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 100000 )
        camera.position.set(p.x, p.y, p.z + (bbox.max.z - bbox.min.z) * 6)
        const controls = new OrbitControls( camera, container )
        controls.target.set(p.x, p.y, p.z)
        return {
            camera,
            controls
        }
    }, [width, height, bbox, container])

    useEffect(() => {
        if (!scene) return
        if (!container) return
        if (!controls) return
        if (!camera) return

        scene.clear()

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );

        while (container.firstChild) container.removeChild(container.firstChild)
        container.appendChild(renderer.domElement)
        
        // var cube = new THREE.Mesh( geometry, material );
        // scene.add( cube );

        // const mesh = new THREE.Mesh( getMeshGeometry(), material );
        // scene.add(mesh)

        
        if (options.showMesh) {
            scene.add(mesh2)
        }

        if (options.showWireframe) {
            const meshGeometryForWireframe = getMeshGeometry(surfaceData, scaleFactor)
            const wireframe = new THREE.WireframeGeometry(meshGeometryForWireframe)
            const wireframeMaterial = new THREE.LineBasicMaterial({color: 0x000000})
            const line = new THREE.LineSegments(wireframe, wireframeMaterial)
            ;(line.material as THREE.Material).depthTest = true
            ;(line.material as THREE.Material).opacity = 0.1
            ;(line.material as THREE.Material).transparent = true
            ;(line.material as THREE.Material).vertexColors = false
            scene.add(line)
        }

        if (currentSlice) {
            const A = currentSlice.transformation
            const p1 = transformPoint(A, [0, 0, 0])
            const p2 = transformPoint(A, [currentSlice.nx, 0, 0])
            const p3 = transformPoint(A, [currentSlice.nx, currentSlice.ny, 0])
            const p4 = transformPoint(A, [0, currentSlice.ny, 0])
            const currentSliceData: SurfaceData = {
                vertices: [p1, p2, p3, p4],
                ifaces: [0, 3, 6],
                faces: [0, 1, 2, 0, 2, 3]
            }
            const currentSliceGeometry = getMeshGeometry(currentSliceData, scaleFactor)
            const sliceMaterial = new THREE.MeshPhongMaterial( {
                side: THREE.DoubleSide,
                color: 0x556677, specular: 0x555555, shininess: 30
            })
            const currentSliceMesh = new THREE.Mesh(currentSliceGeometry, sliceMaterial)
            scene.add(currentSliceMesh)
        }

        const light = new THREE.HemisphereLight();
		scene.add( light );

        const animate = () => {
            requestAnimationFrame( animate );
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;
            controls.update()
            renderer.render( scene, camera );
        };
        animate();
    }, [camera, container, controls, currentSlice, height, mesh2, options.showMesh, options.showWireframe, width, scaleFactor, scene, surfaceData])
    return (
        <div ref={setContainer} />
    )
}

export default SurfaceWidget