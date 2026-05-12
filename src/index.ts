import { PCT } from "./pct/pct";
import { PCT_ErrorLogger } from "./core/error-logger";

//***************************************** */
// EXPERIENCE SCRIPT - EVENT HOOKS
// Mandatory: Include the following BF6 Portal API functions and call the PCT function at top level of each.
//***************************************** */

export function OnGameModeStarted() {
  PCT.Initialize(1001, "1234"); // Adjust as needed. Optional 'defaultConfig' is also available for additional parameters.
}

export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
  PCT.PCTOnPlayerDeployed(eventPlayer).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerDeployed.name,
      `PCTOnPlayerDeployed failed: ${String(error)}`,
      8,
    );
  });
}

export function OnPlayerUndeploy(eventPlayer: mod.Player): void {
  PCT.OnPlayerUndeploy(eventPlayer);
}

export function OnPlayerInteract(
  eventPlayer: mod.Player,
  eventInteractPoint: mod.InteractPoint,
): void {
  PCT.PCTOnPlayerInteract(eventPlayer, eventInteractPoint).catch(
    (error: unknown) => {
      void PCT_ErrorLogger.New(
        OnPlayerInteract.name,
        `PCTOnPlayerInteract failed: ${String(error)}`,
        9,
      );
    },
  );
}

export function OnPlayerLeaveGame(eventNumber: number): void {
  PCT.PCTOnPlayerLeaveGame(eventNumber).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerLeaveGame.name,
      `PCTOnPlayerLeaveGame failed: ${String(error)}`,
      10,
    );
  });
}

export function OnPlayerUIButtonEvent(
  eventPlayer: mod.Player,
  eventUIWidget: mod.UIWidget,
  eventUIButtonEvent: mod.UIButtonEvent,
) {
  PCT.PCTOnPlayerUIButtonEvent(
    eventPlayer,
    eventUIWidget,
    eventUIButtonEvent,
  ).catch((error: unknown) => {
    void PCT_ErrorLogger.New(
      OnPlayerUIButtonEvent.name,
      `PCTOnPlayerUIButtonEvent failed: ${String(error)}`,
      11,
    );
  });
}

export function OnRayCastHit(
  eventPlayer: mod.Player,
  eventPoint: mod.Vector,
  eventNormal: mod.Vector,
): void {
  PCT.PCTOnRayCastHit(eventPlayer, eventPoint, eventNormal);
}

export function OnRayCastMissed(eventPlayer: mod.Player): void {
  PCT.PCTOnRayCastMissed(eventPlayer);
}

export function OnPortalGadgetAimStart(eventPlayer: mod.Player): void {
  if (!mod.IsPlayerValid(eventPlayer))
    console.log("Invalid player in OnPortalGadgetAimStart");

  // NOTE: mod.OnPortalGadgetAimStart() is bugged. eventPlayer is always invalid.

  /*if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetAimStart(eventPlayer);
    return;
  }*/
}

export function OnPortalGadgetAimStop(eventPlayer: mod.Player): void {
  if (!mod.IsPlayerValid(eventPlayer))
    console.log("Invalid player in OnPortalGadgetAimStop");

  // NOTE: mod.OnPortalGadgetAimStop() is bugged. eventPlayer is always invalid.

  /*if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetAimStop(eventPlayer);
    return;
  }*/
}

export function OnPortalGadgetFireStart(eventPlayer: mod.Player): void {
  if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetFireStart(eventPlayer);
    return;
  }
}

export function OnPortalGadgetFireStop(eventPlayer: mod.Player): void {
  if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetFireStop(eventPlayer);
    return;
  }
}

export function OnPortalGadgetLaserToggle(
  eventPlayer: mod.Player,
  eventBoolean: boolean,
): void {
  if (PCT.IsPlayerDirector(eventPlayer)) {
    PCT.PCTOnPortalGadgetLaserToggle(eventPlayer, eventBoolean);
    return;
  }
}
