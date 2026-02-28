"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Draw, drawExistingShapes } from "../draw";
import TopBar from "./TopBar";


interface CanvaComponentProps {
  className: string;
  roomName: string;
  socketRef: React.MutableRefObject<WebSocket | null>;
}
export type ShapesType = "circle" | "rect" | "line";
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
    } | {
      type : "line" , 
      startX : number , 
      startY : number , 
      endX : number ,
      endY : number
    };

export default function CanvaComponent(props: CanvaComponentProps) {
  const canvaRef = useRef<HTMLCanvasElement>(null);
  // const [currShapeType , setcurrShapeType] = useState<ShapesType>("rect");
  const currShapeType = useRef<ShapesType>("line");
  const ShapesDrawn = useRef<Shape[]>([]);
  const [refresher, setRefresher] = useState<number>(0);
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
        console.log(
          "Recived data for roomname " +
            props.roomName +
            " is " +
            shapes.data.msg,
        );

        // console.log(shapes.data.msg);

        shapes.data.msg.forEach((x: any) => {
          const shape: Shape = JSON.parse(x.message);
          console.log("Shape = " + shape);
          ShapesDrawn.current.push(shape);
        });
        console.log(ShapesDrawn.current);
      } catch (e: any) {
        console.log(e.mesage);
      }
    };

    await init();
    if (canvaRef.current) {
      let canvas = canvaRef.current;
      const ctx = canvaRef.current.getContext("2d") as CanvasRenderingContext2D;
      if (!ctx) {
        return;
      }
      const socket = props.socketRef.current;
      if (!socket) {
        return;
      }

      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (!parent) return;

        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        drawExistingShapes(ShapesDrawn, ctx, canvas);
      };

      function handleMessage(msg: MessageEvent) {
        const parsedMessage = JSON.parse(msg.data);
        if (parsedMessage.type == "draw") {
          const drawText = parsedMessage.payload.text;
          const shape: Shape = JSON.parse(drawText);
          ShapesDrawn.current.push(shape);
          drawExistingShapes(ShapesDrawn, ctx, canvas);
        }
      }
      socket.addEventListener("message", handleMessage);
      resizeCanvas();

      const observer = new ResizeObserver(() => {
        resizeCanvas();
      });

      observer.observe(canvas.parentElement!);
      const cleanup = Draw(
        ctx,
        canvas,
        currShapeType,
        ShapesDrawn,
        props.roomName,
        props.socketRef,
      );

      return () => {
        socket.removeEventListener("message", handleMessage);
        cleanup?.();
        observer.disconnect();
      };
    }
  }
  console.log(currShapeType);
  useEffect(() => {
    //a db call is to be made to get all the existing shapes drawn
    getExistingShapes();
  }, [canvaRef, props.roomName]);

  function undoOperation(){
    // let canvas = canvaRef.current;
    // if(!canvas) return;
    // const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    //   if (!ctx) {
    //     return;
    // }

    // let poppedShape = ShapesDrawn.current.pop();
    // console.log("popped" , poppedShape);
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawExistingShapes(ShapesDrawn , ctx , canvas)
  }

  return (
    <div className={props.className}>
      <TopBar currShapeType={currShapeType}
      onClickHandler = {undoOperation}
      />
      <canvas className="bg-black" ref={canvaRef}></canvas>
    </div>
  );
}
