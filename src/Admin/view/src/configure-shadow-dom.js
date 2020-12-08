import { create } from 'jss';
import { jssPreset } from '@material-ui/core/styles';

export const appRoot = document.createElement("div")
appRoot.setAttribute('id', 'app-root')

const styleInsertionPoint = document.createComment('jss-insertion-point')
export const jss = create({
	...jssPreset(),
	insertionPoint: styleInsertionPoint,
})

const robotoFontLink = document.createElement('link')
robotoFontLink.setAttribute("rel", "stylesheet")
robotoFontLink.setAttribute("href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap")

const shadowHost = document.getElementById('wp-coupons-root')
shadowHost.attachShadow({ mode: "open" })

const shadowRoot = shadowHost.shadowRoot
shadowRoot.appendChild(robotoFontLink)
shadowRoot.appendChild(styleInsertionPoint)
shadowRoot.appendChild(appRoot)
