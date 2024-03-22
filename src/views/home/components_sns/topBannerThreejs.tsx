import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CSSPlugin);

/**
 * Galaxy
 */
const parameters = {
    count: 50000,
    size: 0.019,
    radius: 10,
    branches: 3,
    spin: 1.0,
    randomness: 0.2,
    randomnessPower: 2.5,
    insideColor: '#1f83fb',
    outsideColor: '#ff14eb',
};

const TopBannerThreeJS = () => {
    const threeCanvas = useRef<any>(null);
    const camera = useRef<THREE.PerspectiveCamera>();
    const renderRef = useRef<THREE.WebGLRenderer>();

    useEffect(() => {
        threeCanvas.current && init();

        return () => {};
    }, [threeCanvas.current]);

    const init = () => {
        // Canvas
        const canvas = threeCanvas.current;

        // Scene
        const scene = new THREE.Scene();

        let geometry;
        let material;
        let points;

        const generateGalaxy = () => {
            /**
             * Destroy old Galaxy
             */
            if (points !== null) {
                geometry && geometry.dispose();
                material && material.dispose();
                scene.remove(points);
            }

            /**
             * Geometry
             */
            geometry = new THREE.BufferGeometry();

            const positions = new Float32Array(parameters.count * 3);
            const colors = new Float32Array(parameters.count * 3);

            const colorInside = new THREE.Color(parameters.insideColor);
            const colorOutside = new THREE.Color(parameters.outsideColor);

            for (let i = 0; i < parameters.count; i++) {
                const i3 = i * 3;

                // Positions
                const radius = Math.random() * parameters.radius;
                const spinAngle = radius * parameters.spin;
                const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

                const randomX =
                    Math.pow(Math.random(), parameters.randomnessPower) *
                    (Math.random() < 0.5 ? 1 : -1);
                const randomY =
                    Math.pow(Math.random(), parameters.randomnessPower) *
                    (Math.random() < 0.5 ? 1 : -1);
                const randomZ =
                    Math.pow(Math.random(), parameters.randomnessPower) *
                    (Math.random() < 0.5 ? 1 : -1);

                // x
                positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
                // y
                positions[i3 + 1] = randomY;
                // z
                positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

                // Colors
                const mixedColor = colorInside.clone();
                mixedColor.lerp(colorOutside, radius / parameters.radius);

                colors[i3] = mixedColor.r;
                colors[i3 + 1] = mixedColor.g;
                colors[i3 + 2] = mixedColor.b;
            }

            /**
             * Material
             */
            material = new THREE.PointsMaterial({
                size: parameters.size,
                sizeAttenuation: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexColors: true,
            });

            /**
             * Points
             */
            points = new THREE.Points(geometry, material);
            scene.add(points);

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        };

        generateGalaxy();

        /**
         * Sizes
         */
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        /**
         * Camera
         */
        // Base camera
        camera.current = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

        window.addEventListener('resize', () => {
            // Update sizes
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Update camera
            if (camera.current) {
                camera.current.aspect = sizes.width / sizes.height;
                camera.current.updateProjectionMatrix();
            }

            // Update renderer
            renderRef.current?.setSize(sizes.width, sizes.height);
            renderRef.current?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        camera.current.position.x = 3;
        camera.current.position.y = 3.8;
        camera.current.position.z = 3;
        scene.add(camera.current);

        // Controls
        const controls = new OrbitControls(camera.current, canvas);
        controls.enableDamping = false;
        controls.enableZoom = false;

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
        });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderRef.current = renderer;
        /**
         * Animate
         */
        const clock = new THREE.Clock();

        renderer.setAnimationLoop(() => {
            if (!camera.current) return;
            const elapsedTime = clock.getElapsedTime();

            // Update Galaxy
            points.rotation.y = elapsedTime * 0.1;

            // Update controls
            controls.update();

            camera.current?.updateMatrixWorld();

            // Render
            renderRef.current?.render(scene, camera.current);
        });

        initAnimate(scene);
    };

    const initAnimate = (scene) => {
        if (!camera.current) return;

        const bg = document.querySelector('.bannerBgSection .bannerBgThreejs');
        const section = document.querySelector('.bannerBgSection');
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: '0% 0%',
                end: '100% 100%',
                scrub: true,
            },
        });

        tl.to(camera.current.position, {
            duration: 20,
            y: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
                camera.current && renderRef.current?.render(scene, camera.current);
            },
        }).to(bg, {
            filter: 'blur(5px)',
            ease: 'power2.inOut',
            duration: 20,
        });
    };

    return (
        <div className="bannerBgThreejs fixed left-0 top-0 z-0 h-full w-full">
            <canvas className="webgl" ref={threeCanvas}></canvas>
        </div>
    );
};

export default TopBannerThreeJS;
