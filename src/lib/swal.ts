import Swal from "sweetalert2";
import type { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

/**
 * Single source of truth for every SweetAlert2 popup in the app.
 *
 * Two rules matter here:
 *
 * 1. NEVER pass `background` / `color` / `confirmButtonColor` through
 *    the options. SweetAlert2 applies those as INLINE styles, which
 *    beat any stylesheet — that is why the popups used to stay dark
 *    (`#03070E`, white text) even in light theme. All colour now comes
 *    from the `.swal2-*` rules in index.css, which read the same theme
 *    tokens as the rest of the UI and follow `data-theme` for free.
 *
 * 2. `heightAuto: false` and `scrollbarPadding: false`. By default
 *    SweetAlert2 writes `height: auto` onto <html> and pads <body> to
 *    compensate for the hidden scrollbar. With Lenis driving scroll and
 *    Radix already locking it, that combination shifts the page under
 *    the popup. Turning both off keeps the layout still.
 */

const BASE: SweetAlertOptions = {
  position: "center",
  heightAuto: false,
  scrollbarPadding: false,
  buttonsStyling: false, // buttons are styled by index.css instead
  reverseButtons: true, // confirm on the right, matching the app's dialogs
  showClass: { popup: "swal2-show" },
  hideClass: { popup: "swal2-hide" },
};

function themed(options: SweetAlertOptions): SweetAlertOptions {
  const isLight =
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light";

  // Cast: SweetAlertOptions is a discriminated union over `input`, and
  // spreading through it widens the branches past what TS can re-narrow.
  return {
    ...BASE,
    // SweetAlert2's own theme only sets its default palette; our CSS
    // overrides it. Passing it keeps its internal contrast maths sane.
    theme: isLight ? "light" : "dark",
    ...options,
  } as SweetAlertOptions;
}

/** Generic escape hatch — same API as `Swal.fire`, with the app defaults applied. */
export function swalFire(options: SweetAlertOptions): Promise<SweetAlertResult> {
  return Swal.fire(themed(options));
}

/** Small corner toast. Used for "saved", "deleted", "updated" confirmations. */
export function swalToast(
  title: string,
  icon: "success" | "error" | "warning" | "info" = "success"
): Promise<SweetAlertResult> {
  return Swal.fire(
    themed({
      title,
      icon,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
    })
  );
}

/** Blocking success dialog. Pass `timer` for an auto-dismissing variant. */
export function swalSuccess(
  title: string,
  text?: string,
  opts: { timer?: number } = {}
): Promise<SweetAlertResult> {
  return Swal.fire(
    themed({
      icon: "success",
      title,
      text,
      confirmButtonText: "Got it",
      ...(opts.timer ? { timer: opts.timer, showConfirmButton: false } : {}),
    })
  );
}

/** Blocking error dialog. */
export function swalError(
  text: string,
  title = "Something went wrong"
): Promise<SweetAlertResult> {
  return Swal.fire(
    themed({
      icon: "error",
      title,
      text,
      confirmButtonText: "Close",
    })
  );
}

/** Confirm dialog, for flows that are not already using ConfirmActionDialog. */
export function swalConfirm(
  title: string,
  text?: string,
  confirmButtonText = "Confirm"
): Promise<SweetAlertResult> {
  return Swal.fire(
    themed({
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: "Cancel",
    })
  );
}

export default Swal;
