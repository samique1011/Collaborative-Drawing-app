import { Circle, Icon, LineChart, LineDotRightHorizontal, LineSquiggle, Minus, Pencil, RectangleHorizontal, Undo } from "lucide-react";

interface TopBarProps {
  currShapeType: React.MutableRefObject<string>,
  onClickHandler : () => void
}
export default function TopBar(props: TopBarProps) {
  return (
    <div className="m-2 flex justify-center items-center bg-black absolute left-1/2 ">
        <div className="bg-slate-200 flex gap-6 p-2 rounded-md">
            <Circle onClick={() => props.currShapeType.current = "circle"} className="hover:cursor-pointer"></Circle>
            <RectangleHorizontal onClick={() => props.currShapeType.current = "rect"} className="hover:cursor-pointer"/>
            <Minus onClick={() => props.currShapeType.current = "line" }/>
            <Pencil className="hover:cursor-pointer"></Pencil>
            <Undo onClick={props.onClickHandler}/>
        </div>
    </div>
  );
}
