import { FirstAidEntry } from "../components/incidents/injury/types";

export function canEmployeeSign(user: any, entry: FirstAidEntry) {
  return user.id === entry.employeeNumber;
}

export function canFirstAiderSign(user: any, entry: FirstAidEntry) {
  return user.name === entry.firstAider;
}

export function canSafetyReview(user: any) {
  return user.role === "safety_officer";
}