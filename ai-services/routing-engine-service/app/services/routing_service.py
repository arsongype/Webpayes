from typing import List, Dict, Any
from app.schemas.routing_schema import RoutingRequest, RoutingResponse, PaymentChannel

CHANNELS = [
    PaymentChannel(id="bank_transfer", name="Virement bancaire", type="bank", fee_percent=0.02, min_amount=10.0, max_amount=50000.0, processing_time_seconds=3600),
    PaymentChannel(id="mobile_money", name="Mobile Money générique", type="mobile", fee_percent=0.01, min_amount=1.0, max_amount=10000.0, processing_time_seconds=60),
    PaymentChannel(id="card", name="Carte bancaire", type="card", fee_percent=0.03, min_amount=5.0, max_amount=20000.0, processing_time_seconds=30),
    PaymentChannel(id="crypto", name="Crypto", type="crypto", fee_percent=0.005, min_amount=20.0, max_amount=100000.0, processing_time_seconds=600),
    PaymentChannel(id="mvola", name="Mvola (Telma)", type="mobile", fee_percent=0.005, min_amount=100.0, max_amount=500000.0, processing_time_seconds=30),
    PaymentChannel(id="airtel_money", name="Airtel Money", type="mobile", fee_percent=0.007, min_amount=200.0, max_amount=300000.0, processing_time_seconds=45),
    PaymentChannel(id="orange_money", name="Orange Money", type="mobile", fee_percent=0.006, min_amount=150.0, max_amount=400000.0, processing_time_seconds=40),
]

class RoutingService:
    def _filter_available(self, channels: List[PaymentChannel], amount: float) -> List[PaymentChannel]:
        return [c for c in channels if c.available and c.min_amount <= amount <= c.max_amount]

    def _score_channel(self, channel: PaymentChannel, request: RoutingRequest) -> float:
        score = 100.0
        score -= channel.fee_percent * 1000
        if request.urgency_seconds and channel.processing_time_seconds > request.urgency_seconds:
            score -= 50
        if request.preferred_channel and channel.id == request.preferred_channel:
            score += 20
        return score

    def route(self, request: RoutingRequest) -> RoutingResponse:
        available = self._filter_available(CHANNELS, request.amount)
        if not available:
            return RoutingResponse(
                recommended_channel="none",
                reason="Aucun canal disponible pour ce montant.",
                estimated_fee=0.0,
                estimated_arrival_seconds=0,
                alternatives=[],
            )

        scored = [(c, self._score_channel(c, request)) for c in available]
        scored.sort(key=lambda x: x[1], reverse=True)
        best = scored[0][0]
        alternatives = [{"channel": c.id, "name": c.name, "fee": c.fee_percent * request.amount, "score": s} for c, s in scored[1:4]]

        return RoutingResponse(
            recommended_channel=best.id,
            reason=f"Canal recommandé: {best.name} (frais: {best.fee_percent*100}%, délai: {best.processing_time_seconds}s)",
            estimated_fee=best.fee_percent * request.amount,
            estimated_arrival_seconds=best.processing_time_seconds,
            alternatives=alternatives,
        )

routing_service = RoutingService()
