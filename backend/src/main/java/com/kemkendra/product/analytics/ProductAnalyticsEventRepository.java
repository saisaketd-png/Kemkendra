package com.kemkendra.product.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductAnalyticsEventRepository extends JpaRepository<ProductAnalyticsEvent, UUID> {

    @Query("SELECT e.searchTerm as term, COUNT(e) as cnt FROM ProductAnalyticsEvent e " +
           "WHERE e.eventType = 'SEARCH' AND e.searchTerm IS NOT NULL AND e.createdAt >= :from AND e.createdAt < :to " +
           "GROUP BY e.searchTerm ORDER BY cnt DESC")
    List<Object[]> findTopSearchesBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, Pageable pageable);

    @Query("SELECT e.masterProductId as productId, COUNT(e) as cnt FROM ProductAnalyticsEvent e " +
           "WHERE e.eventType = 'VIEW' AND e.masterProductId IS NOT NULL AND e.createdAt >= :from AND e.createdAt < :to " +
           "GROUP BY e.masterProductId ORDER BY cnt DESC")
    List<Object[]> findTopViewedProductsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, Pageable pageable);
}
