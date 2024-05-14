import { IconName, Plugin, addIcon } from 'obsidian';
import { LaserBeamSettingTab } from './settings';

interface LaserBeamSettings {
	laserType: string;
	laserColor: string;
	isLaserActive: boolean;
	laserIntensity: number;
	laserArea: number;
	laserMarginLeft: number;
	laserMarginRight: number;
}

export const DEFAULT_SETTINGS: LaserBeamSettings = {
	laserType: 'line',
	laserColor: 'blue',
	isLaserActive: false,
	laserIntensity: 1.5,
	laserArea: 82,
	laserMarginLeft: 0,
	laserMarginRight: 0
}

export default class LaserBeamPlugin extends Plugin {
	settings: LaserBeamSettings;
	public LB_ICON: IconName = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>';
	private LB_BODY: HTMLElement;

	async onload() {

		await this.loadSettings();
		this.LB_BODY = document.body;
		addIcon('wand-1', this.LB_ICON);

		if (this.settings.isLaserActive) {
			this.activateLaser();
		}

		this.addRibbonIcon('wand-1', 'Laser beam', (evt: MouseEvent) => {

			this.toggleLaser(evt);

		});

		this.addCommand({
			id: 'laser-activate',
			name: 'Toggle laser',
			callback: () => {
				if (this.settings.isLaserActive) {
					this.deactivateLaser();
				} else {
					this.activateLaser();
				}
			}
		});

		this.addCommand({
			id: 'laser-focus',
			name: 'Toggle laser focus type',
			callback: () => {
				if (this.settings.laserType === 'line') {
					this.settings.laserType = 'area';
					this.setLaserType(this.settings.laserType);
					this.saveSettings();
				} else {
					this.settings.laserType = 'line';
					this.setLaserType(this.settings.laserType);
					this.saveSettings();
				}
			}
		});

		this.addSettingTab(new LaserBeamSettingTab(this.app, this));

		this.registerDomEvent(document, 'mousemove', this.throttle((evt: MouseEvent) => {
			if (this.settings.isLaserActive) {
				this.setLaserPos(evt);
			}
		}, 100));

	}

	throttle<T>(fn: (evt: MouseEvent) => T, delay: number): (evt: MouseEvent) => void {
		let isWaiting = false;

		return (evt: MouseEvent) => {
			if (!isWaiting) {
				fn(evt);
				isWaiting = true;
				setTimeout(() => {
					isWaiting = false;
				}, delay);
			}
		};
	}

	toggleLaser(evt: MouseEvent) {
		if (this.settings.isLaserActive) {
			this.deactivateLaser();
		} else {
			this.setLaserPos(evt);
			this.activateLaser();
		}
	}

	activateLaser() {
		this.LB_BODY.classList.add('lb-laser-active');
		this.setLaserType(this.settings.laserType);
		this.setLaserColor(this.settings.laserColor);
		this.setLaserIntensity(this.settings.laserIntensity);
		this.setLaserArea(this.settings.laserArea);
		this.setLaserMargins(this.settings.laserMarginLeft, this.settings.laserMarginRight);
		this.settings.isLaserActive = true;
		this.saveSettings();
	}

	deactivateLaser() {
		this.LB_BODY.classList.remove('lb-laser-active');
		this.settings.isLaserActive = false;
		this.saveSettings();
	}

	setLaserType(val: string) {
		['lb-laser-type-line', 'lb-laser-type-area'].map((c: string) => { this.LB_BODY.classList.remove(c) });
		switch (val) {
			case 'line':
				this.LB_BODY.classList.add('lb-laser-type-line');
				break;
			case 'area':
				this.LB_BODY.classList.add('lb-laser-type-area');
				break;
			default:
				this.LB_BODY.classList.add('lb-laser-type-line');
		}
	}

	setLaserColor(val: string) {
		['lb-laser-blue', 'lb-laser-green', 'lb-laser-orange', 'lb-laser-yellow', 'lb-laser-red', 'lb-laser-pink', 'lb-laser-purple'].map(c => this.LB_BODY.classList.remove(c));

		switch (val) {
			case 'blue':
				this.LB_BODY.classList.add('lb-laser-blue');
				break;
			case 'green':
				this.LB_BODY.classList.add('lb-laser-green');
				break;
			case 'orange':
				this.LB_BODY.classList.add('lb-laser-orange');
				break;
			case 'yellow':
				this.LB_BODY.classList.add('lb-laser-yellow');
				break;
			case 'red':
				this.LB_BODY.classList.add('lb-laser-red');
				break;
			case 'pink':
				this.LB_BODY.classList.add('lb-laser-pink');
				break;
			case 'purple':
				this.LB_BODY.classList.add('lb-laser-purple');
				break;
			default:
				this.LB_BODY.classList.add('lb-laser-blue');
		}
	}

	setLaserPos(evt: MouseEvent): void {

		let LaserBeamPos;

		if (this.settings.laserType === 'line') {
			LaserBeamPos = evt.clientY + 16;
		} else {
			LaserBeamPos = evt.clientY - this.settings.laserArea / 2;
		}

		this.LB_BODY.style.setProperty('--lb-laser-top', LaserBeamPos.toString() + 'px');
	}

	setLaserArea(val: number) {
		if (val >= 30 && val <= 200) {
			this.LB_BODY.style.setProperty('--lb-laser-area', val.toString() + 'px');
		}
	}

	setLaserIntensity(val: number) {
		if (val >= 0 && val <= 3) {
			this.LB_BODY.style.setProperty('--lb-laser-intensity', val.toString());
		}
	}

	setLaserMargins(val1: number, val2: number) {
		if (val1 >= 0 && val1 <= 500) {
			this.LB_BODY.style.setProperty('--lb-laser-margin-left', val1.toString() + 'px');
		}
		if (val2 >= 0 && val2 <= 500) {
			this.LB_BODY.style.setProperty('--lb-laser-margin-right', val2.toString() + 'px');
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

