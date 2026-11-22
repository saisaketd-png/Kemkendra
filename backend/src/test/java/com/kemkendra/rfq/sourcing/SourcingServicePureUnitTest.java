package com.kemkendra.rfq.sourcing;

import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.rfq.sourcing.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class SourcingServicePureUnitTest {

    private SourcingService sourcingService;

    private Map<UUID, SourcingRequest> requestDb;
    private List<SourcingStatusHistory> historyDb;
    private Map<UUID, User> userDb;
    private Map<String, User> userEmailDb;
    private Map<Long, Supplier> supplierDb;
    private Map<UUID, SourcingSupplier> sourcingSupplierDb;
    private Map<UUID, SourcingOutreachLog> outreachDb;
    private Map<UUID, SourcingQuotation> quotationDb;
    private Map<UUID, SourcingProposal> proposalDb;
    private Map<UUID, SourcingProposalOption> proposalOptionDb;

    private User buyer;
    private User admin;
    private Authentication buyerAuth;
    private Authentication adminAuth;

    @BeforeEach
    public void setup() {
        requestDb = new HashMap<>();
        historyDb = new ArrayList<>();
        userDb = new HashMap<>();
        userEmailDb = new HashMap<>();
        supplierDb = new HashMap<>();
        sourcingSupplierDb = new HashMap<>();
        outreachDb = new HashMap<>();
        quotationDb = new HashMap<>();
        proposalDb = new HashMap<>();
        proposalOptionDb = new HashMap<>();

        buyer = new User();
        buyer.setId(UUID.randomUUID());
        buyer.setName("BioPharma Tech");
        buyer.setEmail("buyer@biopharma.com");
        buyer.setRole(UserRole.USER);
        buyer.setStatus(UserStatus.ACTIVE);
        userDb.put(buyer.getId(), buyer);
        userEmailDb.put(buyer.getEmail(), buyer);

        admin = new User();
        admin.setId(UUID.randomUUID());
        admin.setName("Admin Director");
        admin.setEmail("admin@kemkendra.com");
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        userDb.put(admin.getId(), admin);
        userEmailDb.put(admin.getEmail(), admin);

        // Prepopulate a registered supplier in directory to test reuse and deduplication
        Supplier regSupplier = new Supplier();
        regSupplier.setId(101L);
        regSupplier.setName("Aarti Chemicals Ltd");
        regSupplier.setLegalName("Aarti Chemicals Limited");
        regSupplier.setBusinessType("MANUFACTURER");
        regSupplier.setBusinessEmail("contact@aartichem.com");
        regSupplier.setBusinessPhone("+91 98765 43210");
        regSupplier.setAuthorizedRepresentativeName("Mr. Rajesh Sharma");
        regSupplier.setWebsite("https://aartichem.example.com");
        regSupplier.setCity("Vadodara");
        regSupplier.setStateProvince("Gujarat");
        regSupplier.setCountryName("India");
        regSupplier.setVerified(true);
        regSupplier.setVerificationStatus(com.kemkendra.seller.SupplierVerificationStatus.VERIFIED);
        supplierDb.put(regSupplier.getId(), regSupplier);

        buyerAuth = new UsernamePasswordAuthenticationToken(buyer.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        adminAuth = new UsernamePasswordAuthenticationToken(admin.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        SourcingRequestRepository reqRepo = createRepositoryProxy(SourcingRequestRepository.class);
        SourcingAssignmentRepository assignRepo = createRepositoryProxy(SourcingAssignmentRepository.class);
        SourcingSupplierRepository suppRepo = createRepositoryProxy(SourcingSupplierRepository.class);
        SourcingOutreachLogRepository logRepo = createRepositoryProxy(SourcingOutreachLogRepository.class);
        SourcingQuotationRepository quoteRepo = createRepositoryProxy(SourcingQuotationRepository.class);
        SourcingProposalRepository propRepo = createRepositoryProxy(SourcingProposalRepository.class);
        SourcingProposalOptionRepository propOptionRepo = createRepositoryProxy(SourcingProposalOptionRepository.class);
        SourcingStatusHistoryRepository histRepo = createRepositoryProxy(SourcingStatusHistoryRepository.class);
        UserRepository uRepo = createRepositoryProxy(UserRepository.class);
        SupplierRepository directorySuppRepo = createRepositoryProxy(SupplierRepository.class);

        sourcingService = new SourcingService(
                reqRepo, assignRepo, suppRepo, logRepo, quoteRepo, propRepo, propOptionRepo, histRepo, uRepo, directorySuppRepo
        );
    }

    @Test
    public void testCreateRequest_setsSubmittedStatusAndGeneratesReference() {
        CreateSourcingRequestDto dto = new CreateSourcingRequestDto(
                "Ketoconazole USP",
                "APIs",
                BigDecimal.valueOf(250.5),
                "KG",
                "Hyderabad SEZ",
                "65277-42-1",
                "USP Grade",
                "Purity >= 99.0%",
                "USP",
                "Drums",
                BigDecimal.valueOf(4200.00),
                "INR",
                LocalDate.now().plusMonths(2),
                "Strict GMP Certificate required",
                "doc-spec-991"
        );

        SourcingRequestDetailDto detail = sourcingService.createRequest(dto, buyerAuth);

        assertNotNull(detail);
        assertNotNull(detail.id());
        assertNotNull(detail.sourcingRequestReference());
        assertTrue(detail.sourcingRequestReference().startsWith("SRQ-"));
        assertEquals("Ketoconazole USP", detail.productName());
        assertEquals("APIs", detail.category());
        assertEquals(BigDecimal.valueOf(250.5), detail.quantity());
        assertEquals("KG", detail.unit());
        assertEquals("Hyderabad SEZ", detail.deliveryLocation());
        assertEquals(SourcingRequestStatus.SUBMITTED, detail.status());
        assertEquals("INR", detail.currency());
        assertEquals(BigDecimal.valueOf(4200.00), detail.targetPrice());

        // Check history
        assertEquals(1, historyDb.size());
        assertEquals(SourcingRequestStatus.SUBMITTED.name(), historyDb.get(0).getNewStatus());
    }

    @Test
    public void testAddSupplier_autoLinksRegisteredSupplierToAvoidDuplicates() {
        // Create request first
        CreateSourcingRequestDto createDto = new CreateSourcingRequestDto(
                "Ketoconazole USP", "APIs", BigDecimal.valueOf(100), "KG", "Mumbai",
                null, null, null, null, null, null, "INR", null, null, null
        );
        SourcingRequestDetailDto req = sourcingService.createRequest(createDto, buyerAuth);

        // Add supplier by matching existing company name without supplying supplierId
        AddSourcingSupplierDto addDto = new AddSourcingSupplierDto(
                null,
                "Aarti Chemicals Ltd",
                null,
                null,
                null,
                null,
                null,
                null,
                "Ketoconazole, Azoles",
                null,
                "Identified from platform directory"
        );

        SourcingSupplierDto result = sourcingService.addSupplier(req.id(), addDto, adminAuth);

        assertNotNull(result);
        assertEquals(101L, result.supplierId(), "Should auto-link to registered supplier 101L");
        assertEquals("Aarti Chemicals Ltd", result.supplierName());
        assertEquals("Mr. Rajesh Sharma", result.contactPerson(), "Should auto-fill contact person");
        assertEquals("contact@aartichem.com", result.contactEmail(), "Should auto-fill email");
        assertEquals("https://aartichem.example.com", result.website(), "Should auto-fill website");
        assertEquals("MANUFACTURER", result.supplierType());
        assertEquals("VERIFIED", result.verificationStatus());
        assertEquals("IDENTIFIED", result.status());
    }

    @Test
    public void testAddSupplier_preventsDuplicateSupplierOnSameRequest() {
        CreateSourcingRequestDto createDto = new CreateSourcingRequestDto(
                "Ketoconazole USP", "APIs", BigDecimal.valueOf(100), "KG", "Mumbai",
                null, null, null, null, null, null, "INR", null, null, null
        );
        SourcingRequestDetailDto req = sourcingService.createRequest(createDto, buyerAuth);

        AddSourcingSupplierDto addDto = new AddSourcingSupplierDto(
                null, "Gujarat Synthetics", "Sunil Patel", "sunil@gujchem.com", "+91 9999999999",
                "https://gujchem.in", "Surat", "MANUFACTURER", "Solvents", "UNVERIFIED", "Direct contact"
        );
        sourcingService.addSupplier(req.id(), addDto, adminAuth);

        // Attempting to add the same company name to this request must fail
        assertThrows(IllegalArgumentException.class, () -> {
            sourcingService.addSupplier(req.id(), addDto, adminAuth);
        });
    }

    @Test
    public void testLogOutreach_updatesSupplierStatusAndAdvancesRequest() {
        CreateSourcingRequestDto createDto = new CreateSourcingRequestDto(
                "Ketoconazole USP", "APIs", BigDecimal.valueOf(100), "KG", "Mumbai",
                null, null, null, null, null, null, "INR", null, null, null
        );
        SourcingRequestDetailDto req = sourcingService.createRequest(createDto, buyerAuth);

        AddSourcingSupplierDto addDto = new AddSourcingSupplierDto(
                null, "Gujarat Synthetics", "Sunil Patel", "sunil@gujchem.com", "+91 9999999999",
                "https://gujchem.in", "Surat", "MANUFACTURER", "Solvents", "UNVERIFIED", "Direct contact"
        );
        SourcingSupplierDto supp = sourcingService.addSupplier(req.id(), addDto, adminAuth);

        // Manually set request to SOURCING
        requestDb.get(req.id()).setStatus(SourcingRequestStatus.SOURCING);

        // Log outreach with follow-up
        LocalDateTime nextFollowUp = LocalDateTime.now().plusDays(3);
        CreateOutreachLogDto outreachDto = new CreateOutreachLogDto(
                supp.id(),
                "PHONE",
                LocalDateTime.now(),
                "Sunil Patel",
                "INTERESTED",
                "Initial batch inquiry",
                "Spoke with Sunil, they have 300kg ready stock in Surat plant. Sending COA via email.",
                "INTERESTED",
                nextFollowUp,
                "Awaiting COA review"
        );

        SourcingOutreachLogDto logResult = sourcingService.logOutreach(req.id(), outreachDto, adminAuth);

        assertNotNull(logResult);
        assertEquals("PHONE", logResult.outreachChannel());
        assertEquals("INTERESTED", logResult.responseStatus());
        assertEquals("Gujarat Synthetics", logResult.supplierName());
        assertEquals(nextFollowUp, logResult.nextFollowUpDate());

        // Supplier status should be updated to RESPONDED
        assertEquals("RESPONDED", sourcingSupplierDb.get(supp.id()).getStatus());

        // Request status should advance to SUPPLIER_CONTACTED
        assertEquals(SourcingRequestStatus.SUPPLIER_CONTACTED, requestDb.get(req.id()).getStatus());
    }

    @SuppressWarnings("unchecked")
    private <T> T createRepositoryProxy(Class<T> repoInterface) {
        return (T) Proxy.newProxyInstance(
                repoInterface.getClassLoader(),
                new Class<?>[]{repoInterface},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("save".equals(name)) {
                        Object entity = args[0];
                        if (entity instanceof SourcingRequest req) {
                            if (req.getId() == null) req.prePersist();
                            requestDb.put(req.getId(), req);
                            return req;
                        } else if (entity instanceof SourcingStatusHistory hist) {
                            if (hist.getId() == null) hist.prePersist();
                            historyDb.add(hist);
                            return hist;
                        } else if (entity instanceof SourcingSupplier supp) {
                            if (supp.getId() == null) supp.prePersist();
                            sourcingSupplierDb.put(supp.getId(), supp);
                            return supp;
                        } else if (entity instanceof SourcingOutreachLog oLog) {
                            if (oLog.getId() == null) oLog.prePersist();
                            outreachDb.put(oLog.getId(), oLog);
                            return oLog;
                        } else if (entity instanceof SourcingQuotation q) {
                            if (q.getId() == null) q.prePersist();
                            quotationDb.put(q.getId(), q);
                            return q;
                        } else if (entity instanceof SourcingProposal p) {
                            if (p.getId() == null) p.prePersist();
                            proposalDb.put(p.getId(), p);
                            return p;
                        } else if (entity instanceof SourcingProposalOption opt) {
                            if (opt.getId() == null) opt.prePersist();
                            proposalOptionDb.put(opt.getId(), opt);
                            return opt;
                        } else if (entity instanceof User u) {
                            userDb.put(u.getId(), u);
                            userEmailDb.put(u.getEmail(), u);
                            return u;
                        }
                        return entity;
                    } else if ("findById".equals(name)) {
                        Object arg = args[0];
                        if (repoInterface == SourcingRequestRepository.class && arg instanceof UUID uId) {
                            return Optional.ofNullable(requestDb.get(uId));
                        } else if (repoInterface == UserRepository.class && arg instanceof UUID uId) {
                            return Optional.ofNullable(userDb.get(uId));
                        } else if (repoInterface == SupplierRepository.class && arg instanceof Long lId) {
                            return Optional.ofNullable(supplierDb.get(lId));
                        } else if (repoInterface == SourcingSupplierRepository.class && arg instanceof UUID sId) {
                            return Optional.ofNullable(sourcingSupplierDb.get(sId));
                        } else if (repoInterface == SourcingQuotationRepository.class && arg instanceof UUID qId) {
                            return Optional.ofNullable(quotationDb.get(qId));
                        } else if (repoInterface == SourcingProposalRepository.class && arg instanceof UUID pId) {
                            return Optional.ofNullable(proposalDb.get(pId));
                        } else if (repoInterface == SourcingProposalOptionRepository.class && arg instanceof UUID optId) {
                            return Optional.ofNullable(proposalOptionDb.get(optId));
                        }
                        return Optional.empty();
                    } else if ("findByEmail".equals(name)) {
                        String email = (String) args[0];
                        return Optional.ofNullable(userEmailDb.get(email));
                    } else if ("findFirstByNameIgnoreCase".equals(name)) {
                        String sName = (String) args[0];
                        return supplierDb.values().stream()
                                .filter(s -> s.getName() != null && s.getName().equalsIgnoreCase(sName))
                                .findFirst();
                    } else if ("findFirstByBusinessEmailIgnoreCase".equals(name)) {
                        String email = (String) args[0];
                        return supplierDb.values().stream()
                                .filter(s -> s.getBusinessEmail() != null && s.getBusinessEmail().equalsIgnoreCase(email))
                                .findFirst();
                    } else if ("searchSuppliersForSourcing".equals(name)) {
                        String q = (String) args[0];
                        return supplierDb.values().stream()
                                .filter(s -> s.getName().toLowerCase().contains(q.toLowerCase()))
                                .toList();
                    } else if ("existsBySourcingRequestIdAndSupplierNameIgnoreCase".equals(name)) {
                        UUID rId = (UUID) args[0];
                        String sName = (String) args[1];
                        return sourcingSupplierDb.values().stream()
                                .anyMatch(s -> rId.equals(s.getSourcingRequestId()) && sName.equalsIgnoreCase(s.getSupplierName()));
                    } else if ("existsBySourcingRequestIdAndSupplierId".equals(name)) {
                        UUID rId = (UUID) args[0];
                        Long suppId = (Long) args[1];
                        return sourcingSupplierDb.values().stream()
                                .anyMatch(s -> rId.equals(s.getSourcingRequestId()) && suppId.equals(s.getSupplierId()));
                    } else if ("findBySourcingRequestIdAndId".equals(name)) {
                        UUID rId = (UUID) args[0];
                        UUID sId = (UUID) args[1];
                        if (repoInterface == SourcingSupplierRepository.class) {
                            return Optional.ofNullable(sourcingSupplierDb.get(sId))
                                    .filter(s -> rId.equals(s.getSourcingRequestId()));
                        } else if (repoInterface == SourcingQuotationRepository.class) {
                            return Optional.ofNullable(quotationDb.get(sId))
                                    .filter(q -> rId.equals(q.getSourcingRequestId()));
                        } else if (repoInterface == SourcingProposalRepository.class) {
                            return Optional.ofNullable(proposalDb.get(sId))
                                    .filter(p -> rId.equals(p.getSourcingRequestId()));
                        }
                    } else if ("findBySourcingProposalIdAndId".equals(name)) {
                        UUID pId = (UUID) args[0];
                        UUID optId = (UUID) args[1];
                        return Optional.ofNullable(proposalOptionDb.get(optId))
                                .filter(o -> pId.equals(o.getSourcingProposalId()));
                    } else if ("findBySourcingProposalIdOrderByCreatedAtAsc".equals(name)) {
                        UUID pId = (UUID) args[0];
                        return proposalOptionDb.values().stream()
                                .filter(o -> pId.equals(o.getSourcingProposalId()))
                                .sorted(Comparator.comparing(SourcingProposalOption::getCreatedAt))
                                .toList();
                    } else if ("findBySourcingRequestIdAndStatusInOrderByCreatedAtDesc".equals(name)) {
                        UUID rId = (UUID) args[0];
                        List<String> statuses = (List<String>) args[1];
                        return proposalDb.values().stream()
                                .filter(p -> rId.equals(p.getSourcingRequestId()) && statuses.contains(p.getStatus()))
                                .sorted(Comparator.comparing(SourcingProposal::getCreatedAt).reversed())
                                .toList();
                    } else if ("findBySourcingRequestIdOrderByCreatedAtDesc".equals(name)) {
                        UUID rId = (UUID) args[0];
                        if (repoInterface == SourcingSupplierRepository.class) {
                            return sourcingSupplierDb.values().stream()
                                    .filter(s -> rId.equals(s.getSourcingRequestId()))
                                    .sorted(Comparator.comparing(SourcingSupplier::getCreatedAt).reversed())
                                    .toList();
                        } else if (repoInterface == SourcingStatusHistoryRepository.class) {
                            return historyDb.stream()
                                    .filter(h -> rId.equals(h.getSourcingRequestId()))
                                    .toList();
                        } else if (repoInterface == SourcingQuotationRepository.class) {
                            return quotationDb.values().stream()
                                    .filter(q -> rId.equals(q.getSourcingRequestId()))
                                    .sorted(Comparator.comparing(SourcingQuotation::getCreatedAt).reversed())
                                    .toList();
                        } else if (repoInterface == SourcingProposalRepository.class) {
                            return proposalDb.values().stream()
                                    .filter(p -> rId.equals(p.getSourcingRequestId()))
                                    .sorted(Comparator.comparing(SourcingProposal::getCreatedAt).reversed())
                                    .toList();
                        }
                        return List.of();
                    } else if ("findBySourcingRequestIdAndSourcingSupplierIdOrderByLoggedAtDesc".equals(name)) {
                        UUID rId = (UUID) args[0];
                        UUID sId = (UUID) args[1];
                        return outreachDb.values().stream()
                                .filter(o -> rId.equals(o.getSourcingRequestId()) && sId.equals(o.getSourcingSupplierId()))
                                .sorted(Comparator.comparing(SourcingOutreachLog::getLoggedAt).reversed())
                                .toList();
                    } else if ("findBySourcingRequestIdOrderByLoggedAtDesc".equals(name)) {
                        UUID rId = (UUID) args[0];
                        return outreachDb.values().stream()
                                .filter(o -> rId.equals(o.getSourcingRequestId()))
                                .sorted(Comparator.comparing(SourcingOutreachLog::getLoggedAt).reversed())
                                .toList();
                    } else if ("delete".equals(name)) {
                        if (args[0] instanceof SourcingSupplier supp) {
                            sourcingSupplierDb.remove(supp.getId());
                        } else if (args[0] instanceof SourcingQuotation q) {
                            quotationDb.remove(q.getId());
                        } else if (args[0] instanceof SourcingProposal p) {
                            proposalDb.remove(p.getId());
                        } else if (args[0] instanceof SourcingProposalOption opt) {
                            proposalOptionDb.remove(opt.getId());
                        }
                        return null;
                    } else if ("deleteAll".equals(name)) {
                        if (args[0] instanceof Collection<?> col) {
                            for (Object item : col) {
                                if (item instanceof SourcingProposalOption opt) {
                                    proposalOptionDb.remove(opt.getId());
                                }
                            }
                        }
                        return null;
                    }
                    if (method.getReturnType().equals(List.class)) {
                        return List.of();
                    }
                    if (method.getReturnType().equals(Optional.class)) {
                        return Optional.empty();
                    }
                    return null;
                }
        );
    }

    @Test
    public void testAddQuotation_advancesStatusToQuotationsReceivedAndCalculatesLandedCost() {
        // 1. Create a request in SOURCING
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName("Ketoconazole USP");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(100));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.SOURCING);
        request.prePersist();
        requestDb.put(request.getId(), request);

        // 2. Add quotation with delivery charges
        AddSourcingQuotationDto quoteDto = new AddSourcingQuotationDto(
                null,
                "Ketoconazole USP",
                BigDecimal.valueOf(3500.00),
                "INR",
                "KG",
                BigDecimal.valueOf(25),
                BigDecimal.valueOf(500),
                "USP 43",
                "Purity >= 99.5%",
                "25kg Drums",
                7,
                BigDecimal.valueOf(5000.00), // delivery charges = 5000 / 100 kg = 50 per kg
                "100% Advance",
                "DDP",
                LocalDateTime.now().plusDays(14),
                "Direct quote from domestic producer",
                null,
                null,
                false
        );

        SourcingQuotationDto result = sourcingService.addQuotation(request.getId(), quoteDto, adminAuth);

        assertNotNull(result);
        assertEquals(0, BigDecimal.valueOf(3500.00).compareTo(result.unitPrice()));
        // Landed cost = 3500 + (5000 / 100) = 3550.00
        assertEquals(0, new BigDecimal("3550.00").compareTo(result.totalLandedCostPerUnit()));
        // Total cost = (3500 * 100) + 5000 = 355000
        assertEquals(0, new BigDecimal("355000.00").compareTo(result.totalEstimatedCost()));

        // Status advanced to QUOTATIONS_RECEIVED
        assertEquals(SourcingRequestStatus.QUOTATIONS_RECEIVED, request.getStatus());
    }

    @Test
    public void testCreateProposal_persistsCuratedOptionsAndPublishesToBuyer() {
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName("Pregabalin IP");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(200));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.QUOTATIONS_RECEIVED);
        request.prePersist();
        requestDb.put(request.getId(), request);

        CreateProposalOptionDto optA = new CreateProposalOptionDto(
                null,
                "Option A (Recommended)",
                "WHO-GMP Certified Gujarat Manufacturer",
                "Pregabalin IP",
                "IP 2022",
                "Purity >= 99.8%",
                BigDecimal.valueOf(2400.00),
                "INR",
                BigDecimal.valueOf(200),
                "KG",
                BigDecimal.valueOf(50),
                5,
                "25kg HDPE Drum",
                "Door Delivery to Hyderabad SEZ",
                "Escrow terms",
                LocalDateTime.now().plusDays(10),
                "https://cdn.example.com/coa.pdf",
                "Fast dispatch option"
        );

        CreateSourcingProposalDto propDto = new CreateSourcingProposalDto(
                "Sourcing Options for Pregabalin IP (200 KG)",
                "Options verified by technical team",
                "Option A recommended for immediate dispatch",
                "Standard Escrow Terms",
                null,
                List.of(optA),
                true // publishImmediately
        );

        SourcingProposalDto proposal = sourcingService.createProposal(request.getId(), propDto, adminAuth);

        assertNotNull(proposal);
        assertEquals("PUBLISHED", proposal.status());
        assertNotNull(proposal.sentToBuyerAt());
        assertEquals(1, proposal.options().size());
        assertEquals("Option A (Recommended)", proposal.options().get(0).optionLabel());

        // Request status advanced to PROPOSAL_SENT
        assertEquals(SourcingRequestStatus.PROPOSAL_SENT, request.getStatus());
    }

    @Test
    public void testBuyerAccess_onlyPublishedProposalsVisibleAndConfidentialSupplierDataHidden() {
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName("Metformin HCl");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(500));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.PROPOSAL_SENT);
        request.prePersist();
        requestDb.put(request.getId(), request);

        // Add a confidential supplier
        SourcingSupplier supplier = new SourcingSupplier();
        supplier.setSourcingRequestId(request.getId());
        supplier.setSupplierName("Confidential Chemical Corp");
        supplier.setContactPhone("+91 99999 88888");
        supplier.prePersist();
        sourcingSupplierDb.put(supplier.getId(), supplier);

        // Add a raw internal quotation (shareWithBuyer = false)
        SourcingQuotation rawQuote = new SourcingQuotation();
        rawQuote.setSourcingRequestId(request.getId());
        rawQuote.setSourcingSupplierId(supplier.getId());
        rawQuote.setUnitPrice(BigDecimal.valueOf(450.00));
        rawQuote.setCurrency("INR");
        rawQuote.setNotes("Supplier offers 5% rebate off-record");
        rawQuote.setShareWithBuyer(false);
        rawQuote.prePersist();
        quotationDb.put(rawQuote.getId(), rawQuote);

        // Add a published proposal
        SourcingProposal pubProp = new SourcingProposal();
        pubProp.setSourcingRequestId(request.getId());
        pubProp.setProposalReference("PROP-TEST-01");
        pubProp.setTitle("Metformin HCl Commercial Sourcing");
        pubProp.setOfferedPricePerUnit(BigDecimal.valueOf(480.00));
        pubProp.setCurrency("INR");
        pubProp.setQuantity(BigDecimal.valueOf(500));
        pubProp.setUnit("KG");
        pubProp.setStatus("PUBLISHED");
        pubProp.prePersist();
        proposalDb.put(pubProp.getId(), pubProp);

        // Add a DRAFT proposal (not published yet)
        SourcingProposal draftProp = new SourcingProposal();
        draftProp.setSourcingRequestId(request.getId());
        draftProp.setProposalReference("PROP-DRAFT-01");
        draftProp.setTitle("Draft Unfinished Proposal");
        draftProp.setOfferedPricePerUnit(BigDecimal.valueOf(470.00));
        draftProp.setCurrency("INR");
        draftProp.setQuantity(BigDecimal.valueOf(500));
        draftProp.setUnit("KG");
        draftProp.setStatus("DRAFT");
        draftProp.prePersist();
        proposalDb.put(draftProp.getId(), draftProp);

        // Fetch detail as BUYER
        SourcingRequestDetailDto buyerDetail = sourcingService.getRequestDetail(request.getId(), buyerAuth);

        // Security check: raw confidential supplier list is completely hidden from buyer
        assertTrue(buyerDetail.suppliers().isEmpty());
        // Security check: raw internal outreach logs are hidden
        assertTrue(buyerDetail.outreachLogs().isEmpty());
        // Security check: quotation where shareWithBuyer == false is completely hidden
        assertTrue(buyerDetail.quotations().isEmpty());
        // Security check: DRAFT proposal is hidden; only PUBLISHED proposal is returned
        assertEquals(1, buyerDetail.proposals().size());
        assertEquals("PROP-TEST-01", buyerDetail.proposals().get(0).proposalReference());
    }

    @Test
    public void testExpressBuyerInterest_transitionsToNegotiationAndSetsAcceptedOption() {
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName("Paracetamol IP");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(1000));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.PROPOSAL_SENT);
        request.prePersist();
        requestDb.put(request.getId(), request);

        SourcingProposal proposal = new SourcingProposal();
        proposal.setSourcingRequestId(request.getId());
        proposal.setProposalReference("PROP-PARA-01");
        proposal.setTitle("Paracetamol Options");
        proposal.setOfferedPricePerUnit(BigDecimal.valueOf(400.00));
        proposal.setCurrency("INR");
        proposal.setQuantity(BigDecimal.valueOf(1000));
        proposal.setUnit("KG");
        proposal.setStatus("PUBLISHED");
        proposal.prePersist();
        proposalDb.put(proposal.getId(), proposal);

        SourcingProposalOption optionA = new SourcingProposalOption();
        optionA.setSourcingProposalId(proposal.getId());
        optionA.setOptionLabel("Option A");
        optionA.setSupplierDisplayName("Certified Producer");
        optionA.setProductName("Paracetamol IP");
        optionA.setOfferedPricePerUnit(BigDecimal.valueOf(400.00));
        optionA.setCurrency("INR");
        optionA.setQuantity(BigDecimal.valueOf(1000));
        optionA.setUnit("KG");
        optionA.setStatus("OFFERED");
        optionA.prePersist();
        proposalOptionDb.put(optionA.getId(), optionA);

        BuyerOptionDecisionDto decisionDto = new BuyerOptionDecisionDto("ACCEPTED", "Please expedite delivery by 10th of next month");
        SourcingProposalDto updated = sourcingService.expressBuyerInterestInOption(request.getId(), proposal.getId(), optionA.getId(), decisionDto, buyerAuth);

        assertEquals("ACCEPTED", updated.status());
        assertEquals(optionA.getId(), updated.selectedOptionId());
        assertTrue(updated.buyerFeedback().contains("Please expedite delivery"));

        // Request status transitioned to NEGOTIATION
        assertEquals(SourcingRequestStatus.NEGOTIATION, request.getStatus());
    }

    @Test
    public void testBuyerClarification_recordsFeedbackAndHistory() {
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName("Amoxicillin Trihydrate");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(300));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.PROPOSAL_SENT);
        request.prePersist();
        requestDb.put(request.getId(), request);

        SourcingProposal proposal = new SourcingProposal();
        proposal.setSourcingRequestId(request.getId());
        proposal.setProposalReference("PROP-AMOX-01");
        proposal.setTitle("Amoxicillin Trihydrate Proposal");
        proposal.setOfferedPricePerUnit(BigDecimal.valueOf(2800.00));
        proposal.setCurrency("INR");
        proposal.setQuantity(BigDecimal.valueOf(300));
        proposal.setUnit("KG");
        proposal.setStatus("PUBLISHED");
        proposal.prePersist();
        proposalDb.put(proposal.getId(), proposal);

        BuyerClarificationRequestDto clarDto = new BuyerClarificationRequestDto(
                "Can you provide a recent 3-batch COA showing residual solvent analysis?",
                "COA Inquiry"
        );

        SourcingProposalDto updated = sourcingService.submitBuyerClarification(request.getId(), proposal.getId(), clarDto, buyerAuth);

        assertNotNull(updated);
        assertTrue(updated.buyerFeedback().contains("residual solvent analysis"));
        // History record created
        assertTrue(historyDb.stream().anyMatch(h -> h.getReasonOrNotes().contains("Buyer clarification requested")));
    }

    @Test
    public void testProvideAdditionalInformation_transitionsFromMoreInfoToUnderReview() {
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName("Acetaminophen DC90");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(500));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.MORE_INFORMATION_REQUIRED);
        request.setAdditionalRequirements("Standard formulation");
        request.prePersist();
        requestDb.put(request.getId(), request);

        ProvideAdditionalInformationDto dto = new ProvideAdditionalInformationDto(
                "We need bulk density between 0.68 - 0.74 g/ml and EP grade compliance.",
                "doc_spec_789.pdf"
        );

        SourcingRequestDetailDto updated = sourcingService.provideAdditionalInformation(request.getId(), dto, buyerAuth);

        assertNotNull(updated);
        assertEquals(SourcingRequestStatus.UNDER_REVIEW, updated.status());
        assertTrue(updated.additionalRequirements().contains("bulk density between 0.68 - 0.74 g/ml"));
        assertTrue(updated.attachmentReferences().contains("doc_spec_789.pdf"));

        // Verify history entry
        assertTrue(historyDb.stream().anyMatch(h ->
                h.getSourcingRequestId().equals(request.getId()) &&
                h.getReasonOrNotes().contains("Buyer provided additional information") &&
                "UNDER_REVIEW".equals(h.getNewStatus())
        ));
    }

    @Test
    public void testProvideAdditionalInformation_forbiddenForOtherBuyers() {
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(UUID.randomUUID()); // different buyer
        request.setProductName("Ibuprofen 50");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(100));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.MORE_INFORMATION_REQUIRED);
        request.prePersist();
        requestDb.put(request.getId(), request);

        ProvideAdditionalInformationDto dto = new ProvideAdditionalInformationDto(
                "Trying to update someone else's request",
                null
        );

        assertThrows(AccessDeniedException.class, () ->
                sourcingService.provideAdditionalInformation(request.getId(), dto, buyerAuth)
        );
    }
}
