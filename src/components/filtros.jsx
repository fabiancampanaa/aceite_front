// components/Filtros.jsx
import React from "react";
import { Select, Row, Col, Tag } from "antd";

const { Option } = Select;

const FiltroSelect = ({ name, options, value, placeholder, onChange }) => (
  <Select
    mode="multiple"
    style={{ width: "100%" }}
    placeholder={placeholder}
    value={value}
    onChange={(val) => onChange(name, val)}
    allowClear
    showSearch
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.children.toLowerCase().includes(input.toLowerCase())
    }
    tagRender={({ label, closable, onClose }) => (
      <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
        {label}
      </Tag>
    )}
  >
    {options.map((opt) => (
      <Option key={opt} value={opt}>
        {opt}
      </Option>
    ))}
  </Select>
);

const Filtros = ({ filters, filterOptions, onFilterChange, showMarca }) => (
  <Row gutter={16} style={{ marginBottom: 16 }}>
    <Col span={6}>
      <FiltroSelect
        name="marketplaces"
        options={filterOptions.marketplaces || []}
        value={filters.marketplaces || []}
        placeholder="Filtrar por marketplace(s)"
        onChange={onFilterChange}
      />
    </Col>
    <Col span={6}>
      <FiltroSelect
        name="envases"
        options={filterOptions.envases || []}
        value={filters.envases || []}
        placeholder="Filtrar por envase(s)"
        onChange={onFilterChange}
      />
    </Col>
    <Col span={6}>
      <FiltroSelect
        name="productos"
        options={filterOptions.productos || []}
        value={filters.productos || []}
        placeholder="Filtrar por producto(s)"
        onChange={onFilterChange}
      />
    </Col>
    {showMarca && (
      <Col span={6}>
        <FiltroSelect
          name="marcas"
          options={filterOptions.marcas || []}
          value={filters.marcas || []}
          placeholder="Filtrar por marca(s)"
          onChange={onFilterChange}
        />
      </Col>
    )}
  </Row>
);

export default Filtros;
