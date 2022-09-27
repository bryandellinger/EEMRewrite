import { GraphAddress } from "./graphAddress";

export interface GraphRoom{
address: GraphAddress
displayName: string
phone: string
id: string
emailAddress: string
capacity: string
bookingType: string
tags: string[]
building: string
floorNumber: number | null,
label: string
audioDeviceName: string
videoDeviceName: string,
displayDeviceName: string,
isWheelChairAccessible: string,
}