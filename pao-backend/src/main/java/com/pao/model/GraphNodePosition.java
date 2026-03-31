package com.pao.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "graph_node_positions")
public class GraphNodePosition {
    @Id
    private String nodeId; // e.g., "p-1", "o-2"
    private double x;
    private double y;

    public GraphNodePosition() {}

    public GraphNodePosition(String nodeId, double x, double y) {
        this.nodeId = nodeId;
        this.x = x;
        this.y = y;
    }

    public String getNodeId() { return nodeId; }
    public void setNodeId(String nodeId) { this.nodeId = nodeId; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
}
