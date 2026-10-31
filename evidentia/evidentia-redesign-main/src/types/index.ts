export type Status = 'Open'|'In review'|'Completed'|'Processing'|'Queued'|'Failed';
export type EvidenceType = 'video'|'witness'|'sensor';
export type TimestampType = 'absolute'|'relative'|'unknown';
export interface Investigation { id:string; title:string; incidentDate:string; incidentTime?:string; timeUnknown?:boolean; location?:string; description?:string; reference?:string; status:Status; createdAt:string; updatedAt:string }
export interface Evidence { id:string; investigationId:string; type:EvidenceType; filename:string; uploadedAt:string; status:'Queued'|'Processing'|'Completed'|'Failed'; error?:string; size?:number }
export interface EvidenceReference { evidenceId?:string; filename?:string; frame?:number; videoTime?:string; page?:number; paragraph?:string; row?:string; sensorId?:string; excerpt?:string }
export interface Event { id:string; investigationId:string; sourceType:EvidenceType; eventType:string; timestamp?:string; originalTimestamp?:string; timestampType:TimestampType; timestampUncertainty?:string; description:string; vehicleLabel?:string; confidence?:number; classification?:string; reference?:EvidenceReference }
export interface Timeline { events:Event[] }
export interface Report { investigation:Investigation; evidence:Evidence[]; events:Event[]; conflicts:string[]; gaps:string[]; limitations:string[] }
export interface ApiError { message:string; status?:number; details?:unknown }
export interface ApiResponse<T> { data:T; message?:string }
