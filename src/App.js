import React, { useState, useEffect } from "react";
import { Table, Input, Layout, Row, Col, Typography, Space, Select } from "antd";
import "antd/dist/reset.css";
import "./App.css";
import jsonData from "./op.json";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    const groupedData = jsonData.reduce((result, item) => {
      const groupKey = item.TENANT_ID || "Unknown";
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    }, {});

    const groupedArray = Object.entries(groupedData).map(([key, items]) => ({
      key,
      TENANT_ID: key,
      children: items.map((item, index) => ({
        ...item,
        key: `${key}-${index}`,
      })),
    }));

    setData(groupedArray);
    setFilteredData(groupedArray);
  }, []);

  const handleSearch = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);

    const filtered = data
      .map((group) => {
        const children = group.children.filter((item) =>
          Object.values(item).some((value) =>
            (value || "").toString().includes(text)
          )
        );
        return children.length > 0
          ? { ...group, children }
          : null;
      })
      .filter(Boolean);

    setFilteredData(filtered);
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const generateFilters = (dataIndex) => {
    const uniqueValues = new Set();
    jsonData.forEach((item) => {
      if (item[dataIndex] !== undefined) {
        uniqueValues.add(item[dataIndex]);
      }
    });
    return Array.from(uniqueValues).map((value) => ({
      text: value,
      value,
    }));
  };

  const columns = [
    {
      title: "TENANT_ID",
      dataIndex: "TENANT_ID",
      key: "TENANT_ID",
      filters: generateFilters("TENANT_ID"),
      onFilter: (value, record) => record.TENANT_ID === value,
      sorter: (a, b) => a.TENANT_ID.localeCompare(b.TENANT_ID),
    },
    {
      title: "RELATIONSHIP",
      dataIndex: "RELATIONSHIP",
      key: "RELATIONSHIP",
      filters: generateFilters("RELATIONSHIP"),
      onFilter: (value, record) => record.RELATIONSHIP === value,
      sorter: (a, b) => (a.RELATIONSHIP || "").localeCompare(b.RELATIONSHIP || ""),
    },
    ...Object.keys(jsonData[0] || {})
      .filter((key) => key !== "TENANT_ID" && key !== "RELATIONSHIP")
      .map((key) => ({
        title: key,
        dataIndex: key,
        key,
        filters: generateFilters(key),
        onFilter: (value, record) => record[key] === value,
        sorter: (a, b) => (a[key] || "").toString().localeCompare((b[key] || "").toString()),
      })),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <Row justify="center" style={{ marginBottom: "20px" }}>
          <Col>
            <Title level={2}>Grouped Data Table</Title>
          </Col>
        </Row>

        <Row justify="center">
          <Col span={20}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Input
                placeholder="Search..."
                value={searchText}
                onChange={handleSearch}
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  marginBottom: "20px",
                }}
              />
              <div style={{ overflowX: "auto" }}>
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    onChange: handlePaginationChange,
                    showSizeChanger: true,
                  }}
                  expandable={{
                    rowExpandable: (record) => record.children?.length > 0,
                    expandedRowRender: (record) => (
                      <Table
                        columns={columns.slice(1)}
                        dataSource={record.children}
                        pagination={false}
                      />
                    ),
                  }}
                  style={{
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                  }}
                />
              </div>
            </Space>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
