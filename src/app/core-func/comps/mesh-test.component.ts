import {Component, ElementRef, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'amm-mesh-test',
  template: `
      <canvas #canvas></canvas>
  `,
  styles: [``]
})
export class MeshTestComponent implements OnInit, AfterViewInit {
    @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

    private render3!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    // private 3dObjLoader!: THREE.;
    // private dObjLoader!: THREE.Object3D;


    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initThree();
    }

    initThree() {
        const canvas = this.canvasRef.nativeElement;

        this.render3 = new THREE.WebGLRenderer({ alpha: true, canvas });
        this.render3.setClearColor( 0xffff00, 0.20);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

        // Add objects to your scene here
        const geometry = new THREE.BoxGeometry(2,2,2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff20 });
        // this.scene.background = new THREE.Color('transparent');
        // const cube = new THREE.Mesh(geometry, material);

        const loader = new GLTFLoader();
                loader.load(
                    'assets/core-assets/3dOBJs/GLTF/NavBanner.gltf',
                    (gltf) => {
                        this.scene.add(gltf.scene);
                        },
                    undefined,
                    (err) => {
                        console.log('3dObj_Loader_Error', err);
                        }
                );

        // this.scene.add(cube);

        this.camera.position.y = 0;
        this.camera.position.z = 1;


        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render3.render(this.scene, this.camera);
    }

}
