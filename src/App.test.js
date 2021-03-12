import React from "react";
import Adapter from "enzyme-adapter-react-16";
import { mount, configure } from "enzyme";
import "jest-enzyme";
import { act } from 'react-dom/test-utils';
import branch1 from "../public/api/branch1.json";
import branch2 from "../public/api/branch2.json";
import branch3 from "../public/api/branch3.json";
import App from "./App";

configure({
  adapter: new Adapter()
});

const responses = {
  "api/branch1.json": branch1,
  "api/branch2.json": branch2,
  "api/branch3.json": branch3,
  "/api/branch1.json": branch1,
  "/api/branch2.json": branch2,
  "/api/branch3.json": branch3
};

global.fetch = endpoint =>
  Promise.resolve({
    json: () => Promise.resolve(responses[endpoint])
  });

// based on https://blog.pragmatists.com/genuine-guide-to-testing-react-redux-applications-6f3265c11f63
const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

export const flushRequestsAndUpdate = async enzymeWrapper => {
  await flushAllPromises();
  enzymeWrapper.update();
};

it("renders without crashing", async () => {
  await act(async () => mount(<App />));
});

it("renders loading text initially", async () => {
  await act(async () => {
    const app = mount(<App />)
    expect(app).toHaveText("Loading...");
  })
});

it("renders a table after data load", async () => {
    await act(async () => {
      const app = mount(<App />);
      expect(app).toHaveText("Loading...");
      await flushRequestsAndUpdate(app)
          .then(async () => {
            expect(await app.find("table")).toExist();
          })
          .catch(e => console.log("Error in 'renders a table after data load'", e));
    });
});

it("renders rows with product name as key", async () => {
  await act(async () => {
    const app = mount(<App />);
    await flushRequestsAndUpdate(app)
        .then(async () => {
          expect(await app.find("table tbody tr").key.at(56).key()).toEqual("Hominy");
          expect(await app.find("table tbody tr").key.at(73).key()).toEqual("Lychee");
        })
        .catch(e => console.log("Error in 'renders rows with product name as key'", e));
  });
});

it("renders table that is sorted ascending", async () => {
  await act(async () => {
    const app = mount(<App />);
    await flushRequestsAndUpdate(app)
        .then(async () => {
          expect(await app.find("table")).toMatchSnapshot();
        })
        .catch(e => console.log("Error in 'renders table that is sorted ascending'", e));
  })
});

it("calculates total revenue of all branches", async () => {
  await act(async () => {
    const app = mount(<App />);
    await flushRequestsAndUpdate(app)
        .then(async () => {
          expect(await app.find("tfoot td:last-child").text()).toEqual("2,102,619.44")
        })
        .catch(e => console.log("Error in 'calculates total revenue of all branches'", e));
  })
});

it("filters the displayed products", async () => {
  await act(async () => {
    const app = mount(<App />);
    await flushRequestsAndUpdate(app)
        .then(async () => {
          const changeEvent = { target: { value: "pear" } };
          await app.find("input").simulate("change", changeEvent);
          expect(await app.find("tfoot td:last-child").text()).toEqual("60,681.02");
        })
        .catch(e => console.log("Error in 'filters the displayed products'", e));
  })
});
