import type { ReactNode } from "react"

export interface SidebarMenu{
    menu_name:string
    menu_link:string
    menu_icon:ReactNode,
    menu_tip:boolean
}