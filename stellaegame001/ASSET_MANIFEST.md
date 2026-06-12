# Asset Manifest

日期：2026-04-30

## 目录约定

- `assets/`：游戏运行时引用的正式资产。
- `assets/_backup/`：可用于后续替换或重新切图的备用资产，正式包会保留。
- `assets/_archive/concept/`：概念图、imagegen 中间稿、非运行资产。
- `assets/_archive/legacy/`：旧版 runtime 资产或已被新版本替代的素材。
- `assets/_archive/generated-source/`：生成器导出的 source / alpha 中间文件。
- `../tools/`：资产制作工具目录，不进入正式包。
- `dist/formal-release/run-gun-demo/`：正式交付包，只包含游戏本体、已使用资产和备用资产。

## Used Assets

这些文件被当前 `index.html`、`styles.css`、`game.js` 或 `manifest.webmanifest` 直接引用：

```text
assets/audio/slum-alley-chase.mp3
assets/audio/slum-neon-chase-alt.mp3
assets/audio/slum-neon-chase.mp3
assets/audio/virtual-domain-breakout.mp3
assets/bgm-shell-dash-1.mp3
assets/bgm-shell-dash-2.mp3
assets/bgm-shell-rush.mp3
assets/cutins/stellae-lv1-transparent.png
assets/cutins/stellae-lv2-transparent.png
assets/cutins/stellae-lv3-transparent.png
assets/cutins/stellae-lv4-transparent.png
assets/cutins/stellae-lv5-transparent.png
assets/enemy-unit-game.png
assets/production/boss-zero-hour-game.png
assets/production/effects-game.png
assets/production/health-pickup.png
assets/production/item-icons-game.png
assets/production/terrain-props-game.png
assets/production/v2/stage-slum-bg-preview.png
assets/production/v2/stage-virtual-bg-preview.png
assets/projectile-sprites.svg
assets/runtime/characters-v4/actions/arcblade-actions-v1.png
assets/runtime/characters-v4/actions/railgunner-actions-v1.png
assets/runtime/characters-v4/actions/vanguard-actions-v1.png
assets/runtime/characters-v4/arcblade-aim-v4.png
assets/runtime/characters-v4/arcblade-sprite-v4.png
assets/runtime/characters-v4/railgunner-aim-v4.png
assets/runtime/characters-v4/railgunner-sprite-v4.png
assets/runtime/characters-v4/vanguard-aim-v4.png
assets/runtime/characters-v4/vanguard-sprite-v4.png
assets/runtime/v2/boss-slum-recycler-clean.png
assets/runtime/v2/boss-virtual-mirror-clean.png
assets/runtime/v2/enemy-pack-slum-clean.png
assets/runtime/v2/enemy-pack-virtual-clean.png
assets/runtime/v2/slum-terrain-props-clean.png
assets/runtime/v2/virtual-terrain-props-clean.png
assets/stage-rooftop-bg-v2.png
assets/stellae-option-game.png
assets/ui/app-icon.svg
assets/ui/character-cards-v2/arcblade-hud-avatar.png
assets/ui/character-cards-v2/arcblade-select-card.png
assets/ui/character-cards-v2/railgunner-hud-avatar.png
assets/ui/character-cards-v2/railgunner-select-card.png
assets/ui/character-cards-v2/vanguard-hud-avatar.png
assets/ui/character-cards-v2/vanguard-select-card.png
assets/ui/stellae-hud-portrait.png
assets/ui/title-cover.png
```

## Backup Assets

`assets/_backup` 保留可复用但当前不直接引用的资产：

- `character-sources/`：角色 v4 单动作拆分帧、v4 卡面源图。
- `cutins-original/`：星黎大招非透明原图。
- `production-v2-previews/`：v2 资产预览图，可用于后续替换运行时 clean 版本。
- `runtime-v3/`：三角色 v3 运行时备份。
- `ui-kit/`：早期 HUD/卡面/UI 组件源。

## Archived Assets

`assets/_archive` 不进入正式包：

- `concept/`：概念稿、imagegen 过程图。
- `legacy/`：旧版角色、敌人、地形、Boss、svg 原型资产。
- `generated-source/`：生成器输出的 alpha/source 中间文件。

## Formal Package

正式包路径：

```text
dist/formal-release/run-gun-demo
```

正式包应包含：

- `index.html`
- `styles.css`
- `game.js`
- `manifest.webmanifest`
- `service-worker.js`
- `策划草案.md`
- `ASSET_MANIFEST.md`
- `assets/` 中的 Used Assets
- `assets/_backup/`

正式包不包含：

- `../tools/`
- `assets/_archive/`
- `.DS_Store`
- 生成器缓存、node_modules、临时源文件
