import { TileNode } from './TileNode.js';
import * as THREE from 'three';

export class Graph {

	constructor(tileSize, cols, rows) {
		this.nodes = [];
		this.tileSize = tileSize;
		this.cols = cols;
		this.rows = rows;
	}

	length() {
		return this.nodes.length;
	}

	initGraph(grid) {
		this.nodes = [];

		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {

				let type = TileNode.Type.Ground;
				let node = new TileNode(this.nodes.length, i, j, type);

				if (grid.length != 0 && grid[i][j] == 1) {
					node.type = TileNode.Type.Obstacle;
				}
				this.nodes.push(node);
			}
		}

		// Create N,W,E,S,NE,NW,SE,SW edges
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {

				let index = j * this.cols + i;
				let current = this.nodes[index];

				if (current.type == TileNode.Type.Ground) {
					if (i > 0) {
						let west = this.nodes[index - 1];
						current.tryAddEdge(west, this.tileSize);
					}

					if (i < this.cols - 1) {
						let east = this.nodes[index + 1];
						current.tryAddEdge(east, this.tileSize);
					}

					if (j > 0) {
						let north = this.nodes[index - this.cols];
						current.tryAddEdge(north, this.tileSize);
					}

					if (j < this.rows - 1) {
						let south = this.nodes[index + this.cols];
						current.tryAddEdge(south, this.tileSize);
					}

					if (i > 0 && j > 0) {
						let northWest = this.nodes[index - this.cols - 1];
						current.tryAddEdge(northWest, this.tileSize * 1.4);
					}

					if (i > 0 && j < this.rows - 1) {
						let southWest = this.nodes[index + this.cols + 1];
						current.tryAddEdge(southWest, this.tileSize * 1.4);
					}

					if (i < this.cols - 1 && j > 0) {
						let northEast = this.nodes[index - this.cols + 1];
						current.tryAddEdge(northEast, this.tileSize * 1.4);
					}

					if (i < this.cols - 1 && j < this.rows - 1) {
						let southEast = this.nodes[index + this.cols - 1];
						current.tryAddEdge(southEast, this.tileSize * 1.4);
					}
				}
			}
		}
	}

	getNode(x, z) {
		return this.nodes[z * this.cols + x];
	}

	getRandomEmptyTile() {
		let index = Math.floor(Math.random() * (this.nodes.length));
		while (this.nodes[index].type == TileNode.Type.Obstacle) {
			index = Math.floor(Math.random() * (this.nodes.length));
		}
		return this.nodes[index];
	}
}
