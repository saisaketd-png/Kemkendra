package com.kemkendra.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID>, JpaSpecificationExecutor<PurchaseOrder> {

    Optional<PurchaseOrder> findByRfqId(UUID rfqId);

    boolean existsByRfqId(UUID rfqId);

    List<PurchaseOrder> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    Optional<PurchaseOrder> findByIdAndBuyerId(UUID id, UUID buyerId);

    List<PurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);

    Optional<PurchaseOrder> findByIdAndSupplierId(UUID id, Long supplierId);

    long countByStatus(OrderStatus status);

    long countByBuyerId(UUID buyerId);

    long countByBuyerIdAndStatusIn(UUID buyerId, java.util.Collection<OrderStatus> statuses);

    long countByBuyerIdAndStatus(UUID buyerId, OrderStatus status);

    long countBySupplierId(Long supplierId);

    long countBySupplierIdAndStatusIn(Long supplierId, java.util.Collection<OrderStatus> statuses);

    long countBySupplierIdAndStatus(Long supplierId, OrderStatus status);

    List<PurchaseOrder> findTop5ByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    List<PurchaseOrder> findTop5BySupplierIdOrderByCreatedAtDesc(Long supplierId);

    @Query(value = "SELECT nextval('purchase_order_seq')", nativeQuery = true)
    Long getNextPoSequenceValue();
}
