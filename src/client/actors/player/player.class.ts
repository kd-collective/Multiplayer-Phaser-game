import {KeyBoardControl} from "../../controls/keyboard.class";
import {Projectile} from "../../props/powers/projectile/projectile.class";
import {Hud} from "../../hud/hud.class";
import {PlayerEvent} from "../../../shared/events.model";

declare const window: any;

export class Player {
    public player: any;
    public storage: any;

    private angularVelocity: number = 300;
    private controls: KeyBoardControl;
    private powerUp = [];
    private projectile: Projectile;

    constructor(private gameInstance: any, private playerInstance: any) {
        this.storage = window.localStorage;
        this.createPlayer(this.gameInstance);
        this.playerInstance = playerInstance;
    }

    public createPlayer(gameInstance): void {
        this.player = gameInstance.add.sprite(this.playerInstance.x, this.playerInstance.y, 'shooter-sprite');
        gameInstance.physics.arcade.enable(this.player);
        this.player.id = this.playerInstance.id;
        this.player.body.bounce.y = 0;
        this.player.body.gravity.y = 0;
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('accelerating', [1, 0], 50, false);
        this.player.body.drag.set(80);
        this.player.body.maxVelocity.set(100);
        this.player.body.collideWorldBounds = true;
        this.player.name = this.playerInstance.name;
        this.player.health = 100;
        Hud.view(gameInstance, this.player);
        this.assignPickup(gameInstance, this.player);
        this.addControls();
    }

    // @TODO: refactor into data stream
    public view(): void {
        let isFiring: boolean = false;

        if (this.controls.gameControls.cursors.up.isDown) {
            this.gameInstance.physics.arcade.accelerationFromRotation(this.player.rotation, 100, this.player.body.acceleration);
            this.player.animations.play('accelerating');
        } else {
            this.player.body.acceleration.set(0);
        }

        if (this.controls.gameControls.cursors.left.isDown) {
            this.player.body.angularVelocity = -this.angularVelocity;
        } else if (this.controls.gameControls.cursors.right.isDown) {
            this.player.body.angularVelocity = this.angularVelocity;
        } else {
            this.player.body.angularVelocity = 0;
        }

        if (this.controls.gameControls.fireWeapon.isDown) {
            if (this.projectile) {
                this.projectile.fireWeapon();
                isFiring = true;
            } else {
                isFiring = false;
            }
        }
        this.dispatchLocation(this.player, isFiring);
    }

    private dispatchLocation(player, firing): void {
        window.socket.emit(PlayerEvent.coordinates, {
            x: player.position.x,
            y: player.position.y,
            f: firing,
            r: this.player.rotation
        });
    }

    private addControls(): void {
        this.controls = new KeyBoardControl(this.gameInstance);
    }

    private assignPickup(game, player): void {
        this.projectile = new Projectile(game, player);
        this.powerUp.push(this.projectile);
    }

}
