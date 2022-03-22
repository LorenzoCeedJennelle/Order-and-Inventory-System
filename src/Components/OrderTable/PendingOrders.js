import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItemText,
  Typography,
  TableFooter,
  ThemeProvider,
  createTheme,
  Button,
} from "@mui/material";

import { db } from "../../Firebase/utils";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import Loading from "../Loading/loading";

const PendingOrders = () => {
  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  //   useEffect(() => {
  //     let isMounted = true;

  //     const getOrders = async () => {
  //       const ordersRef = collection(db, "orders");
  //       const q = query(ordersRef, where("orderStatus", "==", "Pending"));
  //       const querySnapshot = await getDocs(q);
  //       const arr = [];
  //       querySnapshot.forEach((doc) => {
  //         arr.push({
  //           ...doc.data(),
  //           id: doc.id,
  //         });
  //       });
  //       if (isMounted) {
  //         setOrders(arr);
  //         setLoading(true);
  //       }
  //     };

  //     getOrders().catch((err) => {
  //       if (!isMounted) return;
  //       console.error("failed to fetch data", err);
  //     });

  //     return () => {
  //       isMounted = false;
  //     };
  //   }, []);

  useEffect(() => {
    let isMounted = true;

    const retrieve = async () => {
      const q = query(
        collection(db, "orders"),
        orderBy("orderCreatedAt", "desc")
      );
      await onSnapshot(q, (snapshot) => {
        const arr = [];
        snapshot.forEach((userSnapshot) => {
          arr.push({
            ...userSnapshot.data(),
            id: userSnapshot.id,
          });
        });
        if (isMounted) {
          setOrders(arr);
          setLoading(true);
        }
      });
    };

    retrieve().catch((err) => {
      if (!isMounted) return;
      console.error("failed to fetch data", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  //this one is using the filter to get orders with an orderStatus of Pending
  const filter = orders.filter(
    (v) => v.orderStatus !== undefined && v.orderStatus == "Pending"
  );

  const columns = [
    {
      name: "id",
      label: "System ID", //or the order ID here
      options: {
        filter: true,
        display: false,
      },
    },
    {
      name: "firstName",
      label: "Name",
      options: {
        filter: false,
        display: false,
      },
    },

    {
      name: "lastName",
      label: "Full Name",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return <div>{tableMeta.rowData[1] + " " + tableMeta.rowData[2]}</div>;
        },
      },
    },
    {
      name: "houseNo",
      label: "HouseNo",
      options: {
        filter: false,
        sort: true,
        display: false,
      },
    },
    {
      name: "streetAddress",
      label: "House No & Street Address",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <div>
              {tableMeta.rowData[3]} - {tableMeta.rowData[4]}
            </div>
          );
        },
      },
    },
    {
      name: "barangay",
      label: "Barangay",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "landMark",
      label: "Landmark",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "cartItems",
      label: "Orders",
      options: {
        filter: false,
        sort: true,
        display: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return value;
        },
      },
    },
    {
      name: "cartItems",
      label: "Orders",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return Object.entries(
            value.reduce((prev, item) => {
              if (!prev[item.id]) prev[item.id] = { ...item, nest: [] };
              prev[item.id].nest.push(item);
              return prev;
            }, {})
          ).map(([id, obj], idx) => (
            <List key={id + obj.color}>
              <ListItemText primary={obj.name + " " + obj.size} />

              <li>
                {obj.nest.map((nest, idx) => (
                  <li key={idx}>
                    <ListItemText
                      secondary={nest.color + " (" + nest.quantity + " pcs)"}
                    />
                  </li>
                ))}
              </li>
            </List>
          ));
        },
      },
    },
    {
      name: "totalAmount",
      label: "Total Amount",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return value;
        },
      },
    },
    {
      name: "number",
      label: "Phone Number",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "orderCreatedAt",
      label: "Month",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return new Date(value.seconds * 1000).toLocaleString("en-us", {
            month: "long",
          });
        },
      },
    },
    {
      name: "orderCreatedAt",
      label: "Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return new Date(value.seconds * 1000).toLocaleString("en-us", {
            day: "numeric",
          });
        },
      },
    },
    {
      name: "orderCreatedAt",
      label: "Year",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return new Date(value.seconds * 1000).toLocaleString("en-us", {
            year: "numeric",
          });
        },
      },
    },
    {
      name: "instructions",
      label: "Instructions",
      options: {
        filter: false,
        sort: true,
        display: false,
      },
    },
    {
      name: "Set Order Status",
      options: {
        filter: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <Button onClick={(e) => updateOrderStatus(tableMeta.rowData[0])}>
              Delivered
            </Button>
          );
        },
      },
    },
  ];

  const updateOrderStatus = async (id) => {
    try {
      const orderRef = doc(db, "orders", id);

      // Set the "capital" field of the city 'DC'
      await updateDoc(orderRef, {
        orderStatus: "Delivered",
      });
    } catch (err) {
      console.log(err);
    }
  };

  function handleTableChange(action, tableState) {
    // console.log("handleTableChange:... ", tableState.displayData);
    const totalAmount = calculateTotalSum(tableState.displayData);
    setTotal(totalAmount);
  }

  const calculateTotalSum = (data) => {
    const totalAmount = data
      .map((a) => a.data[9])
      .reduce((a, b) => (a += b), 0);
    return totalAmount;
  };

  const options = {
    filter: true,
    filterType: "multiselect",
    selectableRows: "none",
    responsive: "vertical",
    expandableRows: true,
    onTableChange: handleTableChange,
    onTableInit: handleTableChange,
    renderExpandableRow: (rowData, rowMeta) => {
      return (
        <tr>
          <td colSpan={4}>
            <TableContainer>
              <Table style={{ margin: "0 auto" }}>
                <TableHead>
                  <TableCell align="right">Product</TableCell>
                  <TableCell align="right">Color</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                </TableHead>
                <TableBody>
                  {rowData[7].map((row) => {
                    return (
                      <TableRow key={row.id + row.color}>
                        <TableCell component="th" scope="row" align="right">
                          {row.name + " " + row.size}
                        </TableCell>
                        <TableCell align="right">{row.color}</TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{row.price}</TableCell>
                        <TableCell align="right">
                          {" "}
                          ₱{" "}
                          {Number(row.quantity) *
                            Number(row.price).toLocaleString(
                              navigator.language,
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          .00
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  {" "}
                  <Typography> Instructions: {rowData[14]}</Typography>
                </TableFooter>
              </Table>
            </TableContainer>
          </td>
        </tr>
      );
    },
  };
  return (
    <div style={{ margin: "12px" }}>
      {loading ? (
        <>
          {" "}
          <Typography variant="subtitle1">
            Total amount : ₱{" "}
            {total.toLocaleString(navigator.language, {
              minimumFractionDigits: 2,
            })}
          </Typography>
          <ThemeProvider theme={createTheme()}>
            <MUIDataTable
              title={"Pending Orders"}
              columns={columns}
              data={filter}
              options={options}
            />
          </ThemeProvider>
        </>
      ) : (
        <>
          <Loading />
        </>
      )}
    </div>
  );
};

export default PendingOrders;