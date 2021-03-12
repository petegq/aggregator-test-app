import React, { useEffect, useState } from "react";

import "./App.css";

// I had quite a few errors when running the tests
// so I hope you don't mind that I went through and
// refactored them quite a bit inc. adding quite a lot
// async/await and act() in various places. The snapshot
// seemed out of date too so I updated it also. I'm obviously
// unsure if that's what you were looking for. If it was or it
// wasn't let have a chat about it :)
// Thanks for the test anyway and hopefully chat soon.
// Best,
// Peter

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

const App = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [inMemoryData, setInMemoryData] = useState([]);

    const sortArr = (arr, field) => arr.sort((a, b) => a[field] > b[field] ? 1 : -1);

    const calculateSum = (arr, field) => arr
        .reduce((prev, curr) => prev + curr[field], 0);

    useEffect(() => {
        const getData = () => {
            const branches = ['branch1', 'branch2', 'branch3'];

            Promise.all(
                branches.map(url =>
                    fetch('/api/' + url + '.json')
                        .then(res => {
                            let resJson = res.json()
                            return resJson;
                        })
                )
            ).then(combinedRes => {
                let allBranches = [];
                combinedRes.forEach(productArr => {
                    productArr.products.forEach(product => {
                        let exists = allBranches.findIndex(item => item.name === product.name);
                        if (exists >= 0) {
                            allBranches[exists].sold = allBranches[exists].sold + product.sold
                            allBranches[exists].unitTotal = allBranches[exists].unitPrice * allBranches[exists].sold
                        } else {
                            product.unitTotal = product.unitPrice * product.sold
                            allBranches.push(product)
                        }
                    })
                });
                setData(sortArr(allBranches, 'name'));
                setInMemoryData(sortArr(allBranches, 'name'));
                setLoading(false);
            });
        }
        getData();
    },[])

    const filterData = value => {
        const filteredData = inMemoryData.filter(datum => {
            const name = datum.name.toLowerCase();

            const searchValue = value.toLowerCase();

            return name.indexOf(searchValue) > -1;
        });
        setData([...filteredData]);
    };

    return loading ? (<p>Loading...</p>) : (
      <div className="product-list">
        <label>Search Products</label>
        <input type="text" onChange={e => filterData(e.target.value)}/>
        <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
            {data.map(product => {
                return (
                    <tr key={product.name}>
                        <td>{product.name}</td>
                        <td>{formatNumber(product.unitTotal)}</td>
                    </tr>
                )
            })
            }
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{formatNumber((calculateSum(data, 'unitTotal')))}</td>
          </tr>
        </tfoot>
      </table>

    </div>
  );
}

export default App;


