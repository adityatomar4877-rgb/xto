import uuid
import logging
from typing import Any, Dict, List, Optional
import networkx as nx

from app.schemas.lab import (
    CandidateControl,
    SecurityBudgetRequest,
    RecommendedControl,
    BudgetOptimizationResult,
    ControlAnalysisRequest,
)
from app.schemas.twin import SecurityControl
from xto_core.twin.security_twin import SecurityTwin
from xto_core.graph.security_graph import SecurityGraph
from xto_core.graph.path_engine import AttackPathEngine
from xto_core.prioritization.control_evaluator import ControlEffectivenessEvaluator

logger = logging.getLogger(__name__)


class SecurityBudgetOptimizer:
    """Security Investment Optimization Engine.
    Determines optimal combinations of defensive controls that maximize security improvement
    (critical paths eliminated, blast radius reduction) under a defined financial budget constraint.
    """

    def __init__(self, twin: SecurityTwin):
        self.twin = twin
        self.evaluator = ControlEffectivenessEvaluator(twin)

    def optimize_budget(self, req: SecurityBudgetRequest) -> BudgetOptimizationResult:
        opt_id = f"BUDGET-OPT-{uuid.uuid4().hex[:8].upper()}"
        budget = req.available_budget
        entry_point = req.entry_point_id or "WS-ENG-04"
        target_obj = req.target_objective_id or "VAULT-BACKUP-01"

        # Baseline paths count
        base_graph = SecurityGraph(self.twin)
        base_path_engine = AttackPathEngine(base_graph)
        base_paths = base_path_engine.find_all_attack_paths(entry_point, target_obj, cutoff=8)
        base_paths_count = len(base_paths)

        # Evaluate candidate controls individually first to calculate unit efficiency
        eval_res = self.evaluator.evaluate_controls(
            ControlAnalysisRequest(
                controls=req.candidate_controls or [],
                entry_point_id=entry_point,
                target_objective_id=target_obj,
            )
        )

        candidates = eval_res.evaluated_controls
        # Map original cost from candidate controls
        cost_map = {}
        if req.candidate_controls:
            cost_map = {c.id: c.cost or 10000.0 for c in req.candidate_controls}
        else:
            cost_map = {
                "CTRL-CAND-MFA": 25000.0,
                "CTRL-CAND-SEG": 40000.0,
                "CTRL-CAND-EDR": 30000.0,
                "CTRL-CAND-LEAST-PRIV": 15000.0,
            }

        # Greedy / Knapsack selection based on efficiency (eliminated paths per dollar)
        scored_candidates = []
        for c in candidates:
            cost = cost_map.get(c.control_id, 20000.0)
            efficiency = c.estimated_risk_reduction_percent / max(1.0, cost / 1000.0)
            scored_candidates.append({
                "control": c,
                "cost": cost,
                "efficiency": efficiency,
            })

        # Sort by efficiency descending
        scored_candidates.sort(key=lambda x: x["efficiency"], reverse=True)

        selected_controls: List[RecommendedControl] = []
        spent_budget = 0.0

        for item in scored_candidates:
            cost = item["cost"]
            c_info = item["control"]
            if spent_budget + cost <= budget:
                spent_budget += cost
                selected_controls.append(
                    RecommendedControl(
                        id=c_info.control_id,
                        name=c_info.control_name,
                        control_type=c_info.control_type,
                        cost=cost,
                        critical_paths_eliminated=c_info.critical_paths_eliminated,
                        risk_reduction_percent=c_info.estimated_risk_reduction_percent,
                        security_efficiency_ratio=item["efficiency"],
                    )
                )

        # Test synergistic combined effect of all selected controls in an ephemeral virtual sandbox
        virt_twin = self.twin.fork_virtual_sandbox()
        for rec in selected_controls:
            v_ctrl = SecurityControl(
                id=f"OPT-{rec.id}",
                name=rec.name,
                type=rec.control_type,
                description="Deployed by budget optimizer",
                is_active=True,
                coverage_scope=["VAULT-BACKUP-01", "ID-DOMAIN-ADMIN", "WS-ENG-04"],
                effectiveness=0.98,
                is_virtual=True,
            )
            virt_twin.add_or_update_control(v_ctrl)

        combined_graph = SecurityGraph(virt_twin)
        combined_path_engine = AttackPathEngine(combined_graph)
        remaining_paths = combined_path_engine.find_all_attack_paths(entry_point, target_obj, cutoff=8)
        remaining_count = len(remaining_paths)

        total_eliminated = max(0, base_paths_count - remaining_count)
        total_risk_reduction = (
            round((total_eliminated / max(1, base_paths_count)) * 100.0, 1)
        )
        remaining_budget = max(0.0, budget - spent_budget)
        overall_roi = round(total_risk_reduction / max(1.0, spent_budget / 1000.0), 2)

        return BudgetOptimizationResult(
            optimization_id=opt_id,
            available_budget=budget,
            total_cost=spent_budget,
            remaining_budget=remaining_budget,
            recommended_controls=selected_controls,
            critical_paths_eliminated=total_eliminated,
            remaining_critical_paths=remaining_count,
            total_risk_reduction_percent=total_risk_reduction,
            roi_security_efficiency=overall_roi,
        )
