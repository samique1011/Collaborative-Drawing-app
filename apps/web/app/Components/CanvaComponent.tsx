"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Draw , drawExistingShapes } from "../draw";

interface CanvaComponentProps {
  className: string;
  roomName: string;
  socketRef : React.MutableRefObject<WebSocket | null>
}
export type ShapesType = "circle" | "rect";
export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
    };

export default function CanvaComponent(props: CanvaComponentProps) {
  const canvaRef = useRef<HTMLCanvasElement>(null);
  // const [currShapeType , setcurrShapeType] = useState<ShapesType>("rect");
  const currShapeType = useRef<ShapesType>("rect");
  const ShapesDrawn = useRef<Shape[]>([]);
  const [refresher , setRefresher] = useState<number>(0);

  async function getExistingShapes() {
    const init = async () => {
      try {
        console.log("current roomName = " + props.roomName);
        const shapes = await axios.post(
          "http://localhost:4000/get-shapes",
          {
            roomName: props.roomName,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          },
        );
        console.log("Recived data for roomname " + props.roomName + " is " + shapes.data.msg);

        // console.log(shapes.data.msg);

        shapes.data.msg.forEach((x: any) => {
          const shape: Shape = JSON.parse(x.message);
          console.log("Shape = " + shape);
          ShapesDrawn.current.push(shape);
        });
        console.log(ShapesDrawn.current)
      } catch (e : any) {
        console.log(e.mesage)
      }
    };

    await init();
    //now create the websocket connection here and as the chatbar is doing the join-room handler , idont need to join-room again
    
    
    if (canvaRef.current) {
      let canvas = canvaRef.current;
      const ctx = canvaRef.current.getContext("2d");
      if (!ctx) {
        return;
      }
      const socket = props.socketRef.current;
      if(!socket){
        return;
      }
      socket.onmessage = (msg) => {
      const parsedMessage = JSON.parse(msg.data);
      if(parsedMessage.type == "draw"){
        const drawText = parsedMessage.payload.text;
        const shape : Shape = JSON.parse(drawText);
        ShapesDrawn.current.push(shape);
        drawExistingShapes(ShapesDrawn , ctx , canvas)
      }
    }
      Draw(ctx, canvas, currShapeType, ShapesDrawn, props.roomName , props.socketRef);
    }
  }

  console.log(currShapeType);
  useEffect(() => {
    
    //a db call is to be made to get all the existing shapes drawn
    getExistingShapes();
    return () => {
        
    }
  }, [canvaRef ]);


  return (
    <div className={props.className}>
      <div>
        <button onClick={() => (currShapeType.current = "circle")}>
          Circle
        </button>
        <button onClick={() => (currShapeType.current = "rect")}>
          Rectangle
        </button>
      </div>
      <canvas
        width={1200}
        height={1200}
        className="bg-black"
        ref={canvaRef}
      ></canvas>
    </div>
  );
}
