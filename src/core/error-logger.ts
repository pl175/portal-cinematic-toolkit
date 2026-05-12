/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * ERROR LOGGER
 *************************/

export namespace PCT_ErrorLogger {
  export async function New(
    caller: string,
    message: string,
    errorNumber: number,
  ) {
    let callerTrace = "at <unknown>";

    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split("\n");

      callerTrace = lines[2]?.trim() ?? lines[3]?.trim() ?? callerTrace;
    }

    const tagS = "\n***** PORTAL CAMERA TOOLKIT ERROR START *****\n";
    const tagE = "\n***** PORTAL CAMERA TOOLKIT ERROR END *****";

    console.log(
      tagS + `ERROR <${caller}> ${message} | Called ${callerTrace}` + tagE,
    );

    for (let i = 0; i < 10; i++) {
      mod.DisplayHighlightedWorldLogMessage(
        mod.Message("PCT_ERROR_OCCURED", errorNumber),
      );
      await mod.Wait(0.5);
    }
  }
}
