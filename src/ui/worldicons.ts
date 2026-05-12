/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * WORLD ICON
 *************************/

interface WorldIconOptions {
  text?: mod.Message;
  textVisible?: boolean;
  icon?: mod.WorldIconImages;
  iconVisible?: boolean;
  color?: mod.Vector;
  teamReceiver?: mod.Team;
  playerReceiver?: mod.Player;
}

interface WorldIconState extends WorldIconOptions {
  id: string;
  position: mod.Vector;
  textVisible: boolean;
  iconVisible: boolean;
}

export class PCT_WIM {
  private static instance: PCT_WIM | undefined;
  private readonly icons = new Map<string, mod.WorldIcon>();
  private readonly iconStates = new Map<string, WorldIconState>();

  private constructor() {}

  static init(): PCT_WIM {
    if (PCT_WIM.instance === undefined) {
      PCT_WIM.instance = new PCT_WIM();
    }

    return PCT_WIM.instance;
  }

  private getManaged(
    id: string,
  ): { icon: mod.WorldIcon; state: WorldIconState } | null {
    const icon = this.icons.get(id);
    const state = this.iconStates.get(id);

    if (icon === undefined || state === undefined) {
      return null;
    }

    return { icon, state };
  }

  private applyReceiver(
    icon: mod.WorldIcon,
    state: Pick<WorldIconState, "teamReceiver" | "playerReceiver">,
  ): void {
    if (state.teamReceiver !== undefined) {
      mod.SetWorldIconOwner(icon, state.teamReceiver);
      return;
    }

    if (state.playerReceiver !== undefined) {
      mod.SetWorldIconOwner(icon, state.playerReceiver);
    }
  }

  private applyState(icon: mod.WorldIcon, state: WorldIconState): void {
    this.applyReceiver(icon, state);
    mod.SetWorldIconPosition(icon, state.position);

    if (state.text !== undefined) {
      mod.SetWorldIconText(icon, state.text);
    }

    if (state.icon !== undefined) {
      mod.SetWorldIconImage(icon, state.icon);
    }

    if (state.color !== undefined) {
      mod.SetWorldIconColor(icon, state.color);
    }

    mod.EnableWorldIconText(icon, state.textVisible);
    mod.EnableWorldIconImage(icon, state.iconVisible);
  }

  createIcon(
    id: string,
    position: mod.Vector,
    options?: WorldIconOptions,
  ): mod.WorldIcon {
    if (this.icons.has(id)) {
      this.deleteIcon(id);
    }

    const icon = mod.SpawnObject(
      mod.RuntimeSpawn_Common.WorldIcon,
      position,
      mod.CreateVector(0, 0, 0),
    ) as mod.WorldIcon;

    const state: WorldIconState = {
      id,
      position,
      text: options?.text,
      textVisible: options?.textVisible ?? false,
      icon: options?.icon,
      iconVisible: options?.iconVisible ?? false,
      color: options?.color,
      teamReceiver: options?.teamReceiver,
      playerReceiver: options?.playerReceiver,
    };

    this.applyState(icon, state);

    this.icons.set(id, icon);
    this.iconStates.set(id, state);

    return icon;
  }

  getIcon(id: string): mod.WorldIcon | undefined {
    return this.icons.get(id);
  }

  setPosition(id: string, position: mod.Vector): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.position = position;
    mod.SetWorldIconPosition(managed.icon, position);
  }

  setText(id: string, text: mod.Message): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.text = text;
    mod.SetWorldIconText(managed.icon, text);
  }

  setIcon(id: string, iconImage: mod.WorldIconImages): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.icon = iconImage;
    mod.SetWorldIconImage(managed.icon, iconImage);
  }

  setColor(id: string, color: mod.Vector): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.color = color;
    mod.SetWorldIconColor(managed.icon, color);
  }

  setTextVisible(id: string, visible: boolean): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.textVisible = visible;
    mod.EnableWorldIconText(managed.icon, visible);
  }

  setIconVisible(id: string, visible: boolean): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.iconVisible = visible;
    mod.EnableWorldIconImage(managed.icon, visible);
  }

  setVisible(id: string, iconVisible: boolean, textVisible: boolean): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.iconVisible = iconVisible;
    managed.state.textVisible = textVisible;

    mod.EnableWorldIconImage(managed.icon, iconVisible);
    mod.EnableWorldIconText(managed.icon, textVisible);
  }

  setTeamReceiver(id: string, team: mod.Team): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.teamReceiver = team;
    managed.state.playerReceiver = undefined;

    mod.SetWorldIconOwner(managed.icon, team);
  }

  setPlayerReceiver(id: string, player: mod.Player): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.playerReceiver = player;
    managed.state.teamReceiver = undefined;

    mod.SetWorldIconOwner(managed.icon, player);
  }

  deleteIcon(id: string): void {
    const icon = this.icons.get(id);
    if (icon === undefined) {
      return;
    }

    mod.UnspawnObject(icon);
    this.icons.delete(id);
    this.iconStates.delete(id);
  }

  getIconExists(id: string): boolean {
    return this.icons.has(id);
  }
}
