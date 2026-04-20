import type { Shape, ShapesType } from "../Components/CanvaComponent";
import axios from "axios";
export function Draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  currShapeType: React.MutableRefObject<ShapesType>,
  ShapesDrawn: React.MutableRefObject<Shape[]>,
  roomName: string,
  socketRef: React.MutableRefObject<WebSocket | null>,
) {
  let clicked = false;
  let startX = 0,
    startY = 0;
  let currentPath: {x: number, y: number}[] = [];

  drawExistingShapes(ShapesDrawn, ctx, canvas);

  async function mouseUpListener(e: MouseEvent) {
    clicked = false;
    //you finished drawing to save the
    //based on the type i am going to push the element here
    let currentShapeDrawn = {};
    if (currShapeType.current == "rect") {
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const currX = (e.clientX - rect.left) * scaleX;
      const currY = (e.clientY - rect.top) * scaleY;

      const width = currX - startX;
      const height = currY - startY;

      currentShapeDrawn = {
        type: "rect",
        x: startX,
        y: startY,
        width: width,
        height: height,
      };
    } else if (currShapeType.current == "circle") {
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const currX = (e.clientX - rect.left) * scaleX;
      const currY = (e.clientY - rect.top) * scaleY;

      const width = currX - startX;
      const height = currY - startY;

      const centerX = startX + width / 2;
      const centerY = startY + height / 2;

      const radiusX = Math.abs(width) / 2;
      const radiusY = Math.abs(height) / 2;

      currentShapeDrawn = {
        type: "circle",
        centerX,
        centerY,
        radiusX,
        radiusY,
      };
    } else if (currShapeType.current == "line" || currShapeType.current == "arrow") {
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const endX = (e.clientX - rect.left) * scaleX;
      const endY = (e.clientY - rect.top) * scaleY;

      currentShapeDrawn = {
        type: currShapeType.current,
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
      };
    } else if (currShapeType.current == "pencil" || currShapeType.current == "eraser") {
      currentShapeDrawn = {
        type: currShapeType.current,
        points: [...currentPath],
      };
    }

    ShapesDrawn.current.push(currentShapeDrawn as Shape);
    const ShapeMessage = JSON.stringify(currentShapeDrawn);

    await axios.post(
      "http://localhost:4000/save-shapes",
      {
        roomName: roomName,
        message: ShapeMessage,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    //i have to send it through the websocket connection, that i have drawn a shape
    socketRef.current?.send(
      JSON.stringify({
        type: "draw",
        payload: {
          text: ShapeMessage,
        },
      }),
    );
  }

  function mouseDownListener(e: MouseEvent) {
    clicked = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.x;
    startY = e.clientY - rect.y;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currX = (e.clientX - rect.left) * scaleX;
    const currY = (e.clientY - rect.top) * scaleY;
    currentPath = [{x: currX, y: currY}];
  }
  function mouseMoveListener(e: MouseEvent) {
    if (clicked) {
      console.log(e.clientX + " " + e.clientY);
      if (currShapeType.current == "rect") {
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currX = (e.clientX - rect.left) * scaleX;
        const currY = (e.clientY - rect.top) * scaleY;

        const width = currX - startX;
        const height = currY - startY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawExistingShapes(ShapesDrawn, ctx, canvas);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        ctx.strokeRect(startX, startY, width, height);
      } else if (currShapeType.current == "circle") {
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currX = (e.clientX - rect.left) * scaleX;
        const currY = (e.clientY - rect.top) * scaleY;

        const width = currX - startX;
        const height = currY - startY;

        const centerX = startX + width / 2;
        const centerY = startY + height / 2;

        const radiusX = Math.abs(width) / 2;
        const radiusY = Math.abs(height) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawExistingShapes(ShapesDrawn, ctx, canvas);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (currShapeType.current == "line" || currShapeType.current == "arrow") {
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const endX = (e.clientX - rect.left) * scaleX;
        const endY = (e.clientY - rect.top) * scaleY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawExistingShapes(ShapesDrawn, ctx, canvas);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY); // start point
        ctx.lineTo(endX, endY); // end point
        ctx.stroke();

        if (currShapeType.current === "arrow") {
          const headlen = 15;
          const angle = Math.atan2(endY - startY, endX - startX);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      } else if (currShapeType.current == "pencil" || currShapeType.current == "eraser") {
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const currX = (e.clientX - rect.left) * scaleX;
        const currY = (e.clientY - rect.top) * scaleY;

        currentPath.push({x: currX, y: currY});

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawExistingShapes(ShapesDrawn, ctx, canvas);

        ctx.strokeStyle = currShapeType.current === "eraser" ? "black" : "white";
        ctx.lineWidth = currShapeType.current === "eraser" ? 10 : 2;

        ctx.beginPath();
        if (currentPath.length > 0) {
          ctx.moveTo(currentPath[0]!.x, currentPath[0]!.y);
          for (let i = 1; i < currentPath.length; i++) {
            ctx.lineTo(currentPath[i]!.x, currentPath[i]!.y);
          }
        }
        ctx.stroke();
      }
    }
  }

  canvas.addEventListener("mousemove", mouseMoveListener);
  canvas.addEventListener("mouseup", mouseUpListener);
  canvas.addEventListener("mousedown", mouseDownListener);

  return () => {
    canvas.removeEventListener("mousedown", mouseDownListener);
    canvas.removeEventListener("mouseup", mouseUpListener);
    canvas.removeEventListener("mousemove", mouseMoveListener);
  };
}

export function drawExistingShapes(
  ShapesDrawn: React.MutableRefObject<Shape[]>,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ShapesDrawn.current.map((obj: Shape) => {
    if (obj.type == "rect") {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    } else if (obj.type == "circle") {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        obj.centerX,
        obj.centerY,
        obj.radiusX,
        obj.radiusY,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    } else if (obj.type == "line" || obj.type == "arrow") {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(obj.startX, obj.startY);
      ctx.lineTo(obj.endX, obj.endY);
      ctx.stroke();

      if (obj.type === "arrow") {
        const headlen = 15;
        const angle = Math.atan2(obj.endY - obj.startY, obj.endX - obj.startX);
        ctx.beginPath();
        ctx.moveTo(obj.endX, obj.endY);
        ctx.lineTo(obj.endX - headlen * Math.cos(angle - Math.PI / 6), obj.endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(obj.endX, obj.endY);
        ctx.lineTo(obj.endX - headlen * Math.cos(angle + Math.PI / 6), obj.endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    } else if (obj.type == "pencil" || obj.type == "eraser") {
      ctx.strokeStyle = obj.type === "eraser" ? "black" : "white";
      ctx.lineWidth = obj.type === "eraser" ? 10 : 2;

      if (obj.points && obj.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(obj.points[0]!.x, obj.points[0]!.y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i]!.x, obj.points[i]!.y);
        }
        ctx.stroke();
      }
    }
  });
}
