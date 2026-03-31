import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Users, Building2 } from 'lucide-react';

export type NodeData = {
  label: string;
  type: 'PERSON' | 'ORGANIZATION';
  subLabel?: string;
};

const CustomNode = ({ data }: NodeProps<Node<NodeData>>) => {
  const isPerson = data.type === 'PERSON';

  return (
    <div className={`custom-node ${isPerson ? 'person-node' : 'org-node'}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <div className="node-icon">
          {isPerson ? <Users size={16} /> : <Building2 size={16} />}
        </div>
        <div className="node-info">
          <div className="node-label">{data.label}</div>
          {data.subLabel && <div className="node-sublabel">{data.subLabel}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode);
