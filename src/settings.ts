import { App, DropdownComponent, PluginSettingTab, Setting, SliderComponent } from 'obsidian';
import LaserBeamPlugin from './main';
import { DEFAULT_SETTINGS } from './main';

export class LaserBeamSettingTab extends PluginSettingTab {
    plugin: LaserBeamPlugin;
    dropdownLaserType: DropdownComponent;
    dropdownLaserColor: DropdownComponent;
    sliderIntensity: SliderComponent;
    sliderArea: SliderComponent;

    constructor(app: App, plugin: LaserBeamPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Toggle laser beam')
            .setDesc('Turn on/off laser beam')
            .addButton((btn) => {
                btn.setButtonText("Toggle laser")
                    .setTooltip("Turn on/off laser")
                    .onClick((evt: MouseEvent) => {
                        this.plugin.toggleLaser(evt);
                    })
            });

        new Setting(containerEl)
            .setName('Laser focus type')
            .setDesc('Select laser focus type')
            .addDropdown(sel => {
                this.dropdownLaserType = sel;
                sel.addOption('line', 'Line');
                sel.addOption('area', 'Area');
                sel.onChange(async (val: string) => {
                    this.plugin.settings.laserType = val;

                    this.plugin.setLaserType(val);

                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.laserType);
            }).addExtraButton((btn) => {
                btn.setIcon("rotate-ccw");
                btn.setTooltip("Restore default")
                btn.onClick(() => {
                    this.dropdownLaserType.setValue(DEFAULT_SETTINGS.laserType);
                    this.plugin.settings.laserType = DEFAULT_SETTINGS.laserType;
                    this.plugin.setLaserType(this.plugin.settings.laserType);
                    this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Laser intensity')
            .setDesc('Set laser intensity')
            .addSlider((sli) => {
                this.sliderIntensity = sli;
                let slider_val: number;
                if (this.plugin.settings.laserIntensity) {
                    slider_val = this.plugin.settings.laserIntensity;
                } else {
                    slider_val = DEFAULT_SETTINGS.laserIntensity;
                }
                sli.setDynamicTooltip();
                sli.setLimits(0.5, 3, 0.1);
                sli.setValue(slider_val);
                sli.onChange((val: number) => {

                    this.plugin.settings.laserIntensity = val;
                    this.plugin.setLaserIntensity(val);
                    this.plugin.saveSettings();
                })
            }).addExtraButton((btn) => {
                btn.setIcon("rotate-ccw");
                btn.setTooltip("Restore default")
                btn.onClick(() => {
                    this.sliderIntensity.setValue(DEFAULT_SETTINGS.laserIntensity);
                    this.plugin.settings.laserIntensity = DEFAULT_SETTINGS.laserIntensity;
                    this.plugin.setLaserIntensity(this.plugin.settings.laserIntensity);
                    this.plugin.saveSettings();
                });
            });


        new Setting(containerEl)
            .setName('Laser color')
            .setDesc('Select laser color')

            .addDropdown(sel => {
                this.dropdownLaserColor = sel;
                sel.addOption('blue', 'Blue laser');
                sel.addOption('green', 'Green laser');
                sel.addOption('orange', 'Orange laser');
                sel.addOption('yellow', 'Yellow laser');
                sel.addOption('red', 'Red laser');
                sel.addOption('pink', 'Pink laser');
                sel.addOption('purple', 'Purple laser');
                sel.onChange(async (val: string) => {
                    this.plugin.settings.laserColor = val;
                    this.plugin.setLaserColor(val);
                    await this.plugin.saveSettings();
                }),
                    sel.setValue(this.plugin.settings.laserColor);
            }).addExtraButton((btn) => {
                btn.setIcon("rotate-ccw");
                btn.setTooltip("Restore default")
                btn.onClick(() => {
                    this.dropdownLaserColor.setValue(DEFAULT_SETTINGS.laserColor);
                    this.plugin.settings.laserColor = DEFAULT_SETTINGS.laserColor;
                    this.plugin.setLaserColor(this.plugin.settings.laserColor);
                    this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Laser area size')
            .setDesc('Adjust laser area size')
            .addSlider((sli) => {
                this.sliderArea = sli;
                let slider_val: number;
                if (this.plugin.settings.laserArea) {
                    slider_val = this.plugin.settings.laserArea;
                } else {
                    slider_val = DEFAULT_SETTINGS.laserArea;
                }
                sli.setDynamicTooltip();
                sli.setLimits(30, 200, 1);
                sli.setValue(slider_val);
                sli.onChange((val: number) => {
                    this.plugin.settings.laserArea = val;
                    this.plugin.setLaserArea(val);
                    this.plugin.saveSettings();
                })
            }).addExtraButton((btn) => {
                btn.setIcon("rotate-ccw");
                btn.setTooltip("Restore default")
                btn.onClick(() => {
                    this.sliderArea.setValue(DEFAULT_SETTINGS.laserArea);
                    this.plugin.settings.laserArea = DEFAULT_SETTINGS.laserArea;
                    this.plugin.setLaserArea(this.plugin.settings.laserArea);
                    this.plugin.saveSettings();
                });
            });

    }
}
