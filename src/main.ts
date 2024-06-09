import { Editor, IconName, MarkdownView, Notice, Plugin, addIcon } from 'obsidian';
import { LaserBeamSettingTab } from './settings';

interface LaserBeamSettings {
	isLaserActive: boolean;
	laserMovement: string;
	laserType: string;
	laserColor: string;
	laserWidth: number;
	laserIntensity: number;
	laserArea: number;
	laserMarginLeft: number;
	laserMarginRight: number;
}

export const DEFAULT_SETTINGS: LaserBeamSettings = {
	isLaserActive: false,
	laserMovement: 'dynamic',
	laserType: 'line',
	laserColor: 'blue',
	laserWidth: 1.0,
	laserIntensity: 0.7,
	laserArea: 82,
	laserMarginLeft: 0,
	laserMarginRight: 0
}

export default class LaserBeamPlugin extends Plugin {

	settings: LaserBeamSettings;
	public LB_ICON: IconName = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>';
	private LB_BODY: HTMLElement;
	private lbFontSize: string;
	private cl_editor: Editor;

	async onload() {

		await this.loadSettings();
		this.LB_BODY = document.body;
		addIcon('wand-1', this.LB_ICON);

		new Notice("Version 2.1.0");

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
			if (this.settings.isLaserActive && this.settings.laserMovement === 'dynamic') {
				this.setLaserPos(evt);
			} else {
				return;
			}
		}, 50));

		this.registerDomEvent(document, 'keyup', () => { this.getCaretPos(this.LB_BODY); });
		this.registerDomEvent(document, 'click', () => { this.getCaretPos(this.LB_BODY); });

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
		this.setLaserMovement(this.settings.laserMovement);
		this.setLaserColor(this.settings.laserColor);
		this.setLaserIntensity(this.settings.laserIntensity);
		this.setLaserWidth(this.settings.laserWidth);
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

		let laserBeamPos;

		if (this.settings.laserType === 'line') {
			laserBeamPos = evt.clientY + 16;
		} else {
			laserBeamPos = evt.clientY - this.settings.laserArea / 2;
		}

		this.LB_BODY.style.setProperty('--lb-laser-top', laserBeamPos.toString() + 'px');
	}

	setLaserArea(val: number) {
		if (val >= 30 && val <= 200) {
			this.LB_BODY.style.setProperty('--lb-laser-area', val.toString() + 'px');
		}
	}

	setLaserWidth(val: number) {
		if (val >= 0.3 && val <= 3) {
			this.LB_BODY.style.setProperty('--lb-laser-width', val.toString());
		}
	}

	setLaserIntensity(val: number) {
		if (val >= 0.1 && val <= 0.8) {
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

	setLaserMovement(val: string) {
		if (["dynamic", "static"].includes(val)) {
			this.settings.laserMovement = val;
		}
		this.LB_BODY.classList.remove('lb-laser-static');
		if (val === 'static') {
			this.LB_BODY.classList.add('lb-laser-static')
		} else {
			this.LB_BODY.classList.remove('lb-laser-static');
		}
	}

	getCaretPos(el: HTMLElement) {
		const computedStyle = window.getComputedStyle(this.LB_BODY);
		this.lbFontSize = computedStyle.getPropertyValue('--font-text-size');

		try {
			this.cl_editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor as Editor;

			// @ts-expect-error
			const caretPos = this.cl_editor.cm.coordsAtPos(this.cl_editor.posToOffset(this.cl_editor.getCursor()));
			let pos;
			if (this.settings.laserType === 'line') {
				pos = caretPos.bottom + 5;
				el.style.setProperty('--lb-laser-top', pos.toString() + 'px');
			} else {
				pos = caretPos.bottom - parseInt(this.lbFontSize) + 5 - this.settings.laserArea / 2;
				el.style.setProperty('--lb-laser-top', pos.toString() + 'px');
			}
		} catch (e) {
			return;
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

