import type { Shape , ShapesType } from "../Components/CanvaComponent";
import axios from "axios";
export  function Draw(ctx : CanvasRenderingContext2D , canvas: HTMLCanvasElement , currShapeType : React.MutableRefObject<ShapesType> , ShapesDrawn : React.MutableRefObject<Shape[]>, roomName : string , socketRef : React.MutableRefObject<WebSocket | null>) {

  let clicked = false;
  let startX = 0,   startY = 0;
  
  drawExistingShapes(ShapesDrawn , ctx , canvas);

  async function mouseUpListener(e : MouseEvent){
    clicked = false;
    //you finished drawing to save the 
    //based on the type i am going to push the element here
    let currentShapeDrawn = {};
    if(currShapeType.current == "rect"){
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        currentShapeDrawn = {
            type : "rect",
            x : startX , 
            y : startY ,
            width : width,
            height : height
        }
        
    }
    else if(currShapeType.current == "circle"){
        const rect = canvas.getBoundingClientRect();
        const currX = e.clientX - rect.left;
        const currY = e.clientY - rect.top;
        const width = currX - startX;
        const height = currY - startY;

        const centerX = startX + width / 2;
        const centerY = startY + height / 2;

        const radiusX = Math.abs(width) / 2;
        const radiusY = Math.abs(height) / 2;

        currentShapeDrawn = {
            type : "circle" ,
            centerX : centerX ,
            centerY : centerY , 
            radiusX : radiusX , 
            radiusY : radiusY
        }
    }

    ShapesDrawn.current.push(currentShapeDrawn as Shape)
    const ShapeMessage = JSON.stringify(currentShapeDrawn);

    await axios.post("http://localhost:4000/save-shapes" , {
        roomName : roomName ,
        message : ShapeMessage
    } , {
        headers : {
            Authorization : localStorage.getItem('token')
        }
    })

    //i have to send it through the websocket connection, that i have drawn a shape
    socketRef.current?.send(JSON.stringify({
        type : "draw" , 
        payload : {
            text : ShapeMessage
        }
    }));
  }

  function mouseDownListener(e : MouseEvent){
    clicked = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.x;
    startY = e.clientY - rect.y;
  }
  function mouseMoveListener(e : MouseEvent){
        if (clicked) {
        console.log(e.clientX + " " + e.clientY);
        if(currShapeType.current == "rect"){
            const width = e.clientX - startX;
            const height = e.clientY - (startY);
            ctx.clearRect(0, 0 , canvas.width , canvas.height);
            drawExistingShapes(ShapesDrawn , ctx , canvas);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx?.strokeRect(startX, startY, width, height);
        }
        else if(currShapeType.current == "circle"){
            const rect = canvas.getBoundingClientRect();
            const currX = e.clientX - rect.left;
            const currY = e.clientY - rect.top;

            const width = currX - startX;
            const height = currY - startY;

            const centerX = startX + width / 2;
            const centerY = startY + height / 2;

            const radiusX = Math.abs(width) / 2;
            const radiusY = Math.abs(height) / 2;

            ctx.clearRect(0 , 0 , canvas.width , canvas.height);
            drawExistingShapes(ShapesDrawn , ctx , canvas);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(centerX , centerY , radiusX , radiusY , 0 , 0 , Math.PI * 2);
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
  }

}

export function drawExistingShapes(ShapesDrawn :  React.MutableRefObject<Shape[]> , ctx : CanvasRenderingContext2D , canvas : HTMLCanvasElement){
    ctx.clearRect(0 , 0 , canvas.width , canvas.height);
    ShapesDrawn.current.map((obj : Shape) => {
        if(obj.type == 'rect'){
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x , obj.y , obj.width , obj.height)
        }
        else if(obj.type == 'circle'){
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(obj.centerX , obj.centerY , obj.radiusX , obj.radiusY , 0 , 0 , Math.PI * 2);
            ctx.stroke(); 
        }
    })

}
