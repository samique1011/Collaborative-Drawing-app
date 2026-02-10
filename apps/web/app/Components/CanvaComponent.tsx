"use client";

interface CanvaComponentProps {
    className : string
}
export default function CanvaComponent(props : CanvaComponentProps){
    return <div className={props.className}>
        Canva Component
    </div>
}