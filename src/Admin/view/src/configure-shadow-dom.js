import { create } from "jss";
import { jssPreset } from "@material-ui/core/styles";

const appContainer = document.createElement("div");
export const appRoot = document.createElement("div");
appRoot.setAttribute("id", "app-root");

const styleInsertionPoint = document.createComment("jss-insertion-point");
export const jss = create({
	...jssPreset(),
	insertionPoint: styleInsertionPoint,
});

const robotoFontLink = document.createElement("link");
robotoFontLink.setAttribute("rel", "stylesheet");
robotoFontLink.setAttribute(
	"href",
	"https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
);

// The shadow DOM has to be configured beforehand to allow style-loader to inject styles into shadow DOM.
const shadowHost = document.getElementById("unique-coupons-root");
const shadowRoot = shadowHost.shadowRoot;
shadowRoot.appendChild(appContainer);
appContainer.appendChild(robotoFontLink);
appContainer.appendChild(styleInsertionPoint);
appContainer.appendChild(appRoot);
