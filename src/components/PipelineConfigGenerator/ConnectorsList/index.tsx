import React from "react";
import Typography from '@mui/material/Typography';

export class Connector {
  description: string;
}

export interface ConnectorItemProps {
  connector: Connector;
}

const ConnectorItem: React.FC<ConnectorItemProps> = (props) => (
  <div>
    <Typography>{props.connector.description}</Typography>
  </div>
);

interface ConnectorListProps {
  connectors: Connector[];
}

const ConnectorList: React.FC<ConnectorListProps> = ({ connectors }) => {
  return (
    <>
      {connectors.map((connector) => (
        <ConnectorItem key={connector.description} connector={connector} />
      ))}
    </>
  );
};

export default ConnectorList;