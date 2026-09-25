"""
PRAMAN AI Microservice — Phase 6: Cartel & Collusion Graph Detection Engine

Constructs multi-entity relationship graphs across competing bidders to identify
bid-rigging syndicates using NetworkX connected component analysis.

Entity Types (Graph Nodes):
  - BIDDER: Competing vendors
  - DIRECTOR: Shared directors (by DIN/PAN)
  - BANK_ACCOUNT: Shared bank accounts
  - PHONE: Shared phone numbers
  - EMAIL: Shared email addresses
  - ADDRESS: Shared physical addresses (by PIN code + line1)
  - METADATA_AUTHOR: Shared PDF author metadata fingerprint

Edge Types:
  - HAS_DIRECTOR, SHARES_BANK, SHARES_PHONE, SHARES_EMAIL,
    SHARES_ADDRESS, SAME_DOC_AUTHOR

Risk Classification:
  - CRITICAL: Shared directors OR bank accounts (strongest collusion signal)
  - HIGH: Shared address, phone, or document metadata

Based on Section 7.7 & 9.2 of the PRAMAN blueprint.
Uses: NetworkX for graph analysis, outputs Cytoscape.js JSON for React frontend.
"""

import networkx as nx
from typing import List, Dict, Any

from schemas.cartel import (
    BidderInput,
    CollusionCluster,
    CollusionDetectionResponse,
    CytoscapeElement,
    ImplicatedBidder,
    SharedEntity,
    CollusionRiskLevel,
)


class CollusionDetector:
    """
    Builds a heterogeneous entity graph from bidder data and detects
    collusion rings via connected component analysis.
    """

    def __init__(self):
        self.graph = nx.Graph()

    def build_bidding_network(self, bidders_data: List[BidderInput]) -> None:
        """
        Populates graph with Bidders and shared attribute nodes:
          - Directors (PAN/DIN)
          - Phone Numbers & Emails
          - Bank Account Numbers
          - Physical Addresses / PIN codes
          - PDF Author Metadata
        """
        self.graph.clear()

        for bidder in bidders_data:
            bidder_id = f"BIDDER_{bidder.id}"
            bidder_label = bidder.legalBusinessName
            self.graph.add_node(bidder_id, type="BIDDER", label=bidder_label)

            # Link Directors
            for director in bidder.directors:
                dir_key = director.get("pan") or director.get("din") or director.get("name", "")
                if not dir_key:
                    continue
                dir_id = f"DIR_{dir_key}"
                self.graph.add_node(dir_id, type="DIRECTOR", label=director.get("name", dir_key))
                self.graph.add_edge(bidder_id, dir_id, relation="HAS_DIRECTOR")

            # Link Bank Accounts
            bank = bidder.bankAccountDetails or {}
            if bank.get("accountNumber"):
                bank_id = f"BANK_{bank['accountNumber']}_{bank.get('ifscCode', '')}"
                self.graph.add_node(
                    bank_id, type="BANK_ACCOUNT",
                    label=f"A/C: ...{bank['accountNumber'][-4:]}"
                )
                self.graph.add_edge(bidder_id, bank_id, relation="SHARES_BANK")

            # Link Phone Numbers
            if bidder.primaryPhone:
                phone_id = f"PHONE_{bidder.primaryPhone}"
                self.graph.add_node(phone_id, type="PHONE", label=bidder.primaryPhone)
                self.graph.add_edge(bidder_id, phone_id, relation="SHARES_PHONE")

            # Link Email Addresses
            if bidder.primaryEmail:
                email_id = f"EMAIL_{bidder.primaryEmail.lower()}"
                self.graph.add_node(email_id, type="EMAIL", label=bidder.primaryEmail)
                self.graph.add_edge(bidder_id, email_id, relation="SHARES_EMAIL")

            # Link Physical Address (by PIN code + street)
            addr = bidder.registeredAddress or {}
            if addr.get("pincode") and addr.get("line1"):
                clean_addr = f"{addr['line1'].strip().lower()}_{addr['pincode']}"
                addr_id = f"ADDR_{hash(clean_addr)}"
                self.graph.add_node(
                    addr_id, type="ADDRESS",
                    label=f"PIN {addr['pincode']}"
                )
                self.graph.add_edge(bidder_id, addr_id, relation="SHARES_ADDRESS")

            # Link PDF Metadata Author Fingerprint
            meta_author = bidder.fileMetadataAuthor
            if meta_author and meta_author not in ["None", "Microsoft Office", ""]:
                author_id = f"AUTHOR_{meta_author}"
                self.graph.add_node(author_id, type="METADATA_AUTHOR", label=meta_author)
                self.graph.add_edge(bidder_id, author_id, relation="SAME_DOC_AUTHOR")

    def detect_collusion_rings(self) -> CollusionDetectionResponse:
        """
        Finds connected components containing >= 2 competing bidders.
        Calculates risk severity and returns Cytoscape-compatible graph JSON.
        """
        suspicious_clusters: List[CollusionCluster] = []
        bidder_nodes = [
            n for n, d in self.graph.nodes(data=True)
            if d.get("type") == "BIDDER"
        ]

        # Analyze connected components
        for component in nx.connected_components(self.graph):
            subgraph = self.graph.subgraph(component)
            bidders_in_cluster = [
                n for n in subgraph.nodes
                if subgraph.nodes[n].get("type") == "BIDDER"
            ]

            if len(bidders_in_cluster) > 1:
                # Collusion ring detected!
                shared_attributes = [
                    SharedEntity(
                        id=n,
                        type=subgraph.nodes[n].get("type", "UNKNOWN"),
                        label=subgraph.nodes[n].get("label"),
                    )
                    for n in subgraph.nodes
                    if subgraph.nodes[n].get("type") != "BIDDER"
                ]

                implicated = [
                    ImplicatedBidder(
                        id=b,
                        name=self.graph.nodes[b].get("label", b),
                    )
                    for b in bidders_in_cluster
                ]

                # Risk: CRITICAL if shared directors or bank accounts
                has_critical = any(
                    e.type in ["DIRECTOR", "BANK_ACCOUNT"]
                    for e in shared_attributes
                )
                risk_level = (
                    CollusionRiskLevel.CRITICAL if has_critical
                    else CollusionRiskLevel.HIGH
                )

                suspicious_clusters.append(CollusionCluster(
                    clusterSize=len(bidders_in_cluster),
                    implicatedBidders=implicated,
                    sharedEntities=shared_attributes,
                    riskLevel=risk_level,
                ))

        # Convert graph to Cytoscape.js elements for React frontend
        cytoscape_elements: List[CytoscapeElement] = []

        for node, data in self.graph.nodes(data=True):
            cytoscape_elements.append(CytoscapeElement(data={
                "id": node,
                "label": data.get("label", node),
                "type": data.get("type"),
            }))

        for u, v, data in self.graph.edges(data=True):
            cytoscape_elements.append(CytoscapeElement(data={
                "source": u,
                "target": v,
                "relation": data.get("relation"),
            }))

        return CollusionDetectionResponse(
            totalBidders=len(bidder_nodes),
            collusionRingsDetected=len(suspicious_clusters),
            clusters=suspicious_clusters,
            cytoscapeGraph=cytoscape_elements,
        )


def detect_collusion(bidders: List[BidderInput]) -> CollusionDetectionResponse:
    """
    Convenience function: Build network + detect rings in one call.
    This is the main entry point called by the router.
    """
    detector = CollusionDetector()
    detector.build_bidding_network(bidders)
    return detector.detect_collusion_rings()
