import {assert, elementUpdated, fixture, html, nextFrame, oneEvent} from "@open-wc/testing";
import * as sinon from "sinon";
import {Et2Template} from "../Et2Template";
import {Et2Description} from "../../Et2Description/Et2Description";

/**
 * Test file for Template webComponent
 *
 * In here we test just basics and simple loading to avoid as few additional dependencies as possible.
 */
// Stub global egw
// @ts-ignore
window.egw = {
	debug: () => {},
	image: () => "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjNjk2OTY5IiBkPSJNNi45NDMsMjguNDUzDQoJYzAuOTA2LDAuNzY1LDIuMDk3LDEuMTI3LDMuMjg2LDEuMTA5YzAuNDMsMC4wMTQsMC44NTItMC4wNjgsMS4yNjUtMC4yMDdjMC42NzktMC4xOCwxLjMyOC0wLjQ1LDEuODY2LTAuOTAyTDI5LjQwMywxNC45DQoJYzEuNzcyLTEuNDk4LDEuNzcyLTMuOTI1LDAtNS40MjJjLTEuNzcyLTEuNDk3LTQuNjQ2LTEuNDk3LTYuNDE4LDBMMTAuMTE5LDIwLjM0OWwtMi4zODktMi40MjRjLTEuNDQtMS40NTctMy43NzItMS40NTctNS4yMTIsMA0KCWMtMS40MzgsMS40Ni0xLjQzOCwzLjgyNSwwLDUuMjgxQzIuNTE4LDIzLjIwNiw1LjQ3NCwyNi45NDcsNi45NDMsMjguNDUzeiIvPg0KPC9zdmc+DQo=",
	lang: i => i + "*",
	link: i => i,
	tooltipUnbind: () => { },
	webserverUrl: ""
};
let element : Et2Template;
let keepImport : Et2Description = new Et2Description();

async function before()
{
	// Create an element to test with, and wait until it's ready
	// @ts-ignore
	element = await fixture(html`
        <et2-template>
        </et2-template>
	`);
	// Stub egw()
	sinon.stub(element, "egw").returns(window.egw);
	await elementUpdated(element);
	return element;
}

function fakedTemplate(template_text)
{
	const parser = new window.DOMParser();
	return parser.parseFromString(template_text, "text/xml").children[0];
}

const SIMPLE_EMPTY = `<overlay><template id="simple.empty"></template></overlay>`;
const SIMPLE = `<overlay><template id="simple">
<et2-description id="static" value="Static value"></et2-description>
<et2-description id="test"></et2-description>
</template></overlay>`;
const TEMPLATE_ATTRIBUTES = `<overlay><template id="attributes" class="gotClass" slot="gotSlot"></template></overlay>`;
const MULTIPLE = `<overlay>
	<template id="multiple.one" class="one"/>
	<template id="multiple.two" class="two"/>
	<template id="multiple" class="multiple"></template>
	</overlay>`;
const INVALID = `<overlay><template id="invalid"><overlay>`;

// Pre-fill cache
Et2Template.templateCache["simple.empty"] = <Element>fakedTemplate(SIMPLE_EMPTY).childNodes.item(0);
Et2Template.templateCache["simple"] = <Element>fakedTemplate(SIMPLE).childNodes.item(0);
Et2Template.templateCache["attributes"] = <Element>fakedTemplate(TEMPLATE_ATTRIBUTES).childNodes.item(0);

describe("Template widget basics", () =>
{
	// Setup run before each test
	beforeEach(before);
	// Make sure it works
	it('is defined', () =>
	{
		assert.instanceOf(element, Et2Template);
	});
	it("starts empty", () =>
	{
		assert.notExists(element.querySelectorAll("*"), "Not-loaded template has content.  It should be empty.");
	});
});
describe("Loading", () =>
{
	beforeEach(before);
	it("loads from file", async() =>
	{
		// Stub the url to point to the fixture
		let xml = fakedTemplate(SIMPLE_EMPTY);

		// @ts-ignore
		sinon.stub(element, "loadFromFile").returns(xml);

		const listener = oneEvent(element, "load");

		// Set the template to start load
		element.template = "simple.empty";

		// Wait for load & load event
		await element.updateComplete;
		const loadEvent = await listener;

		assert.exists(loadEvent);
	})
	it("loads from cache", async() =>
	{
		// Cache was pre-filled above
		const listener = oneEvent(element, "load");

		// Set the template to start load
		element.template = "simple.empty";

		// Wait for load & load event
		await element.updateComplete;
		const loadEvent = await listener;

		assert.exists(loadEvent);
	});
	it("loads with short name (from cache)", async() =>
	{
		// Cache was pre-filled above

		const listener = oneEvent(element, "load");
		// @ts-ignore
		sinon.stub(element, "getRoot").returns({
			getInstanceManager: () => {return {name: "simple"}}
		});

		// Set the template to start load, but use "short" name
		element.template = "empty";

		// Wait for load & load event
		await element.updateComplete;
		const loadEvent = await listener;

		assert.exists(loadEvent);
	});
	it("takes template attributes", async() =>
	{
		// Set the template to start load
		element.template = "attributes";

		// Wait for load
		await element.updateComplete;

		assert.isTrue(element.classList.contains("gotClass"), "Did not get class from template");
		assert.isTrue(element.hasAttribute("slot"), "Did not get slot from template");
		assert.equal(element.getAttribute("slot"), "gotSlot", "Did not get slot from template");
	});
	it("loads last template in file when it has no template otherwise", async() =>
	{
		const listener = oneEvent(element, "load");
		// Stub the url to point to the fixture
		let xml = fakedTemplate(MULTIPLE);

		// @ts-ignore
		sinon.stub(element, "loadFromFile").returns(xml);

		// We don't set the template, just give the URL
		element.id = "Test-template";
		element.url = "load a file that has several template"
		element.requestUpdate("url");

		// Wait for load
		await listener;

		assert.isTrue(element.classList.contains("multiple"));
	});

	it("shows loader while loading", async() =>
	{
		// @ts-ignore
		sinon.stub(element, "findTemplate").returns(new Promise((resolve) =>
		{
			// It's not good to wait in the test, but...
			setTimeout(() => resolve(Et2Template.templateCache["simple.empty"]), 100);
		}));

		// Set the template to start load
		element.template = "simple.empty";

		// Wait for load to start
		await nextFrame();

		// Check for loader
		let loader = element.shadowRoot.querySelector(".template--loading");
		assert.isNotNull(loader, "Loader (shown while loading) not found")

		// Wait for load, check the loader is gone
		await oneEvent(element, "load");
		loader = element.shadowRoot.querySelector(".template--loading");
		assert.isNull(loader, "Loader still there after load");
	});

	it("actually creates children", async() =>
	{
		// Set the template to start load
		element.template = "simple";

		// Wait for load
		await element.updateComplete;

		// Should be not be empty
		assert.isNotEmpty(element.querySelectorAll("*"));
		assert.isNotNull(element.querySelector("#static"), "Missing template element");
		assert.isNotNull(element.querySelector("#test"), "Missing template element");
	})
	it("does not load when disabled", async() =>
	{
		// Disable
		// @ts-ignore can't find disabled attribute, though it's inherited from Et2Widget
		element.disabled = true;

		// Set the template to start load
		element.template = "simple";

		// Wait for load
		await element.updateComplete;

		// Should be empty
		assert.isEmpty(element.querySelectorAll("*"));
	});
	it("shows a message when it can't find the template", async() =>
	{
		// Set the template to start load
		element.template = "fail";

		// Wait for load
		await element.updateComplete;

		// Should be not be empty, it has some error text
		assert.isNotEmpty(element.querySelectorAll("*"));
		assert.isTrue(element.innerText.includes("failed"));
	})
});