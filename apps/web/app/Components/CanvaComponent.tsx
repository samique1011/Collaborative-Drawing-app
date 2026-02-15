"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Draw from "../draw";

interface CanvaComponentProps {
  className: string;
  roomName: string;
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
    if (canvaRef.current) {
      let canvas = canvaRef.current;
      const ctx = canvaRef.current.getContext("2d");
      if (!ctx) {
        return;
      }
      Draw(ctx, canvas, currShapeType, ShapesDrawn, props.roomName);
    }
  }

  console.log(currShapeType);
  useEffect(() => {
    //a db call is to be made to get all the existing shapes drawn
    getExistingShapes();
    return () => {
        
    }
  }, [canvaRef]);

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
