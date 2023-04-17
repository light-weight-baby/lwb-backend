import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./createEvent.css";
import CreateEventPop from "./createEventPop";

export default function CreateEventButton() {
  const [clicked, setClicked] = useState<boolean>(false);

  const clickHandler = (event: MouseEvent) => {
    logoutRemoval(event, setClicked);
  };

  const logoutRemoval = (e: MouseEvent, setClicked: any) => {
    const target = e.target as Element;
    if (target && !target.closest(".createEventCover")) {
      setClicked(false);
      document.removeEventListener("click", clickHandler);
    }
  };

  const click = () => {
    setClicked(clicked === false);
    document.addEventListener("click", clickHandler);
  };
  return (
    <div className="createEventCover">
      <button
        onClick={click}
        className={!clicked ? "createEvent" : "createEvent createEventClicked"}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <div>{clicked && <CreateEventPop />}</div>
    </div>
  );
}