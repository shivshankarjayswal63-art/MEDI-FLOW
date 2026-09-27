import { createContext, useContext } from "react";

export const PatientPortalContext = createContext(false);

export function usePatientPortal() {
  return useContext(PatientPortalContext);
}
