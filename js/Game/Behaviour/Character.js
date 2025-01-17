import * as THREE from 'three';

export class Character {

	constructor(mColor) {
		this.size = 20;

		let vehicleGeo = new THREE.BoxGeometry(4, 4, 8);
		let vehicleMat = new THREE.MeshStandardMaterial({ color: mColor });

		let mesh = new THREE.Mesh(vehicleGeo, vehicleMat);

		// Increment the y position so our cone is just atop the y origin
		// mesh.position.y = mesh.position.y+1;

		this.gameObject = new THREE.Group();
		this.gameObject.add(mesh);

		this.location = new THREE.Vector3(0, 0, 0);
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.acceleration = new THREE.Vector3(0, 0, 0);
		this.orientation = new THREE.Vector3(0, 0, 0);
		this.topSpeed = 50;
		this.mass = 1;
		this.frictionMagnitude = 0;
	}

	setModel(model) {
		model.position.y = model.position.y + 1;

		var bbox = new THREE.Box3().setFromObject(model);
		let dz = bbox.max.z - bbox.min.z;

		let scale = this.size / dz;
		model.scale.set(scale, scale, scale);

		this.gameObject = new THREE.Group();
		this.gameObject.add(model);
	}

	update(deltaTime, gameMap) {
		this.physics(gameMap);
		this.velocity.addScaledVector(this.acceleration, deltaTime);

		if (this.velocity.length() > 0) {
			if (Math.abs(this.velocity.x) > 0.14 || Math.abs(this.velocity.z) > 0.14) {
				let angle = Math.atan2(this.velocity.x, this.velocity.z);
				this.gameObject.rotation.y = angle;
				this.orientation = this.velocity.clone();
			}
			if (this.velocity.length() > this.topSpeed) {
				this.velocity.setLength(this.topSpeed);
			}
			this.location.addScaledVector(this.velocity, deltaTime);
		}

		this.gameObject.position.set(this.location.x, this.location.y, this.location.z);
		this.acceleration.multiplyScalar(0);
	}

	checkEdges(gameMap) {
		let node = gameMap.quantize(this.location);
		let nodeLocation = gameMap.localize(node);

		if (!node.hasEdgeTo(node.x - 1, node.z)) {
			let nodeEdge = nodeLocation.x - gameMap.tileSize / 2;
			let characterEdge = this.location.x - this.size / 2;
			if (characterEdge < nodeEdge) {
				this.location.x = nodeEdge + this.size / 2;
			}
		}

		if (!node.hasEdgeTo(node.x + 1, node.z)) {
			let nodeEdge = nodeLocation.x + gameMap.tileSize / 2;
			let characterEdge = this.location.x + this.size / 2;
			if (characterEdge > nodeEdge) {
				this.location.x = nodeEdge - this.size / 2;
			}

		}
		if (!node.hasEdgeTo(node.x, node.z - 1)) {
			let nodeEdge = nodeLocation.z - gameMap.tileSize / 2;
			let characterEdge = this.location.z - this.size / 2;
			if (characterEdge < nodeEdge) {
				this.location.z = nodeEdge + this.size / 2;
			}
		}

		if (!node.hasEdgeTo(node.x, node.z + 1)) {
			let nodeEdge = nodeLocation.z + gameMap.tileSize / 2;
			let characterEdge = this.location.z + this.size / 2;
			if (characterEdge > nodeEdge) {
				this.location.z = nodeEdge - this.size / 2;
			}
		}
	}

	applyForce(force) {
		// here, we are saying force = force/mass
		force.divideScalar(this.mass);
		// this is acceleration + force/mass
		this.acceleration.add(force);
	}

	physics(gameMap) {
		this.checkEdges(gameMap);

		let friction = this.velocity.clone();
		friction.y = 0;
		friction.multiplyScalar(-1);
		friction.normalize();
		friction.multiplyScalar(this.frictionMagnitude);
		this.applyForce(friction)
	}
}