!include "nsDialogs.nsh"

; Add our customizations to the finish page
!macro customFinishPage
XPStyle on

Var DetectDlg
Var FinishDlg
Var LotusSquirrelInstallLocation
Var LotusSquirrelInstallVersion
Var LotusSquirrelUninstaller
Var CheckboxUninstall
Var UninstallLotusSquirrelInstall
Var BackButton
Var NextButton

Page custom detectOldLotusVersion detectOldLotusVersionPageLeave
Page custom finish finishLeave

; Add a page offering to uninstall an older build installed into the lotus-blockchain dir
Function detectOldLotusVersion
  ; Check the registry for old lotus-blockchain installer keys
  ReadRegStr $LotusSquirrelInstallLocation HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\lotus-blockchain" "InstallLocation"
  ReadRegStr $LotusSquirrelInstallVersion HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\lotus-blockchain" "DisplayVersion"
  ReadRegStr $LotusSquirrelUninstaller HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\lotus-blockchain" "QuietUninstallString"

  StrCpy $UninstallLotusSquirrelInstall ${BST_UNCHECKED} ; Initialize to unchecked so that a silent install skips uninstalling

  ; If registry keys aren't found, skip (Abort) this page and move forward
  ${If} LotusSquirrelInstallVersion == error
  ${OrIf} LotusSquirrelInstallLocation == error
  ${OrIf} $LotusSquirrelUninstaller == error
  ${OrIf} $LotusSquirrelInstallVersion == ""
  ${OrIf} $LotusSquirrelInstallLocation == ""
  ${OrIf} $LotusSquirrelUninstaller == ""
  ${OrIf} ${Silent}
    Abort
  ${EndIf}

  ; Check the uninstall checkbox by default
  StrCpy $UninstallLotusSquirrelInstall ${BST_CHECKED}

  ; Magic create dialog incantation
  nsDialogs::Create 1018
  Pop $DetectDlg

  ${If} $DetectDlg == error
    Abort
  ${EndIf}

  !insertmacro MUI_HEADER_TEXT "Uninstall Old Version" "Would you like to uninstall the old version of Lotus Blockchain?"

  ${NSD_CreateLabel} 0 35 100% 12u "Found Lotus Blockchain $LotusSquirrelInstallVersion installed in an old location:"
  ${NSD_CreateLabel} 12 57 100% 12u "$LotusSquirrelInstallLocation"

  ${NSD_CreateCheckBox} 12 81 100% 12u "Uninstall Lotus Blockchain $LotusSquirrelInstallVersion"
  Pop $CheckboxUninstall
  ${NSD_SetState} $CheckboxUninstall $UninstallLotusSquirrelInstall
  ${NSD_OnClick} $CheckboxUninstall SetUninstall

  nsDialogs::Show

FunctionEnd

Function SetUninstall
  ; Set UninstallLotusSquirrelInstall accordingly
  ${NSD_GetState} $CheckboxUninstall $UninstallLotusSquirrelInstall
FunctionEnd

Function detectOldLotusVersionPageLeave
  ${If} $UninstallLotusSquirrelInstall == 1
    ; This could be improved... Experiments with adding an indeterminate progress bar (PBM_SETMARQUEE)
    ; were unsatisfactory.
    ExecWait $LotusSquirrelUninstaller ; Blocks until complete (doesn't take long though)
  ${EndIf}
FunctionEnd

Function finish

  ; Magic create dialog incantation
  nsDialogs::Create 1018
  Pop $FinishDlg

  ${If} $FinishDlg == error
    Abort
  ${EndIf}

  GetDlgItem $NextButton $HWNDPARENT 1 ; 1 = Next button
  GetDlgItem $BackButton $HWNDPARENT 3 ; 3 = Back button

  ${NSD_CreateLabel} 0 35 100% 12u "Lotus has been installed successfully!"
  EnableWindow $BackButton 0 ; Disable the Back button
  SendMessage $NextButton ${WM_SETTEXT} 0 "STR:Let's Farm!" ; Button title is "Close" by default. Update it here.

  nsDialogs::Show

FunctionEnd

; Copied from electron-builder NSIS templates
Function StartApp
  ${if} ${isUpdated}
    StrCpy $1 "--updated"
  ${else}
    StrCpy $1 ""
  ${endif}
  ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
FunctionEnd

Function finishLeave
  ; Launch the app at exit
  Call StartApp
FunctionEnd

; Section
; SectionEnd
!macroend
