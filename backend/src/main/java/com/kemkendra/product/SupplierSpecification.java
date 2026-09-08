package com.kemkendra.product;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.seller.SupplierVerificationStatus;
import java.util.ArrayList;
import java.util.List;

public class SupplierSpecification {
    public static Specification<Supplier> searchAndFilter(
            String search,
            String country,
            Boolean verified,
            Boolean exportReady) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Never show soft-deleted or suspended users to the public
            Join<Supplier, User> userJoin = root.join("user", JoinType.LEFT);
            predicates.add(criteriaBuilder.or(criteriaBuilder.isNull(userJoin), criteriaBuilder.isNull(userJoin.get("deletedAt"))));
            predicates.add(criteriaBuilder.or(criteriaBuilder.isNull(userJoin), criteriaBuilder.notEqual(userJoin.get("status"), UserStatus.SUSPENDED)));

            // 2. Filter out suspended and rejected suppliers
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.isNull(root.get("verificationStatus")),
                    criteriaBuilder.and(
                            criteriaBuilder.notEqual(root.get("verificationStatus"), SupplierVerificationStatus.SUSPENDED),
                            criteriaBuilder.notEqual(root.get("verificationStatus"), SupplierVerificationStatus.REJECTED)
                    )
            ));

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern);
                Predicate slugMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("slug")), searchPattern);
                Predicate countryMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("countryName")), searchPattern);
                
                predicates.add(criteriaBuilder.or(nameMatch, slugMatch, countryMatch));
            }

            if (country != null && !country.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("countryCode")), country.trim().toLowerCase()));
            }

            if (verified != null) {
                predicates.add(criteriaBuilder.equal(root.get("verified"), verified));
            }

            if (exportReady != null) {
                predicates.add(criteriaBuilder.equal(root.get("exportReady"), exportReady));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
