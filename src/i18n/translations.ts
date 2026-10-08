export type Language = 'en' | 'de';

export interface Translations {
  // Navigation & Sidebar
  nav: {
    orders: string;
    masterData: string;
    customerMaster: string;
    articleMaster: string;
    userManagement: string;
    uploadOrder: string;
    collapseSidebar: string;
    expandSidebar: string;
    pendingCount: string;
  };

  // Header & User Profile
  header: {
    notifications: string;
    userProfile: string;
    emailId: string;
    role: string;
    logOut: string;
    language: string;
    english: string;
    german: string;
  };

  // Statuses
  status: {
    processing: string;
    needsReview: string;
    xmlGenerated: string;
    failed: string;
    completed: string;
    exported: string;
    all: string;
    active: string;
    inactive: string;
  };

  // Common Actions & Buttons
  common: {
    search: string;
    filter: string;
    filterBy: string;
    export: string;
    import: string;
    save: string;
    cancel: string;
    close: string;
    edit: string;
    delete: string;
    actions: string;
    back: string;
    next: string;
    apply: string;
    reset: string;
    confirm: string;
    download: string;
    view: string;
    viewDetails: string;
    upload: string;
    loading: string;
    yes: string;
    no: string;
    retry: string;
    activeFilters: string;
    clearFilters: string;
    noDataFound: string;
    allCaughtUp: string;
    recordsFound: string;
    page: string;
    of: string;
    showing: string;
    results: string;
  };

  // Orders Listing (POQueueTable)
  orders: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    uploadOrderBtn: string;
    table: {
      orderId: string;
      customer: string;
      sourceFile: string;
      sourceType: string;
      receivedDate: string;
      status: string;
      completeness: string;
      actions: string;
      generateXml: string;
      viewXml: string;
      deleteOrder: string;
    };
    filterModal: {
      title: string;
      statusLabel: string;
      customerLabel: string;
      uploadedByLabel: string;
      dateModeLabel: string;
      singleDate: string;
      dateRange: string;
      dateLabel: string;
      fromDate: string;
      toDate: string;
      resetBtn: string;
      applyBtn: string;
      cancelBtn: string;
    };
    stats: {
      total: string;
      needsReview: string;
      processing: string;
      xmlGenerated: string;
      failed: string;
    };
    confirmDelete: {
      title: string;
      message: string;
      confirmBtn: string;
      cancelBtn: string;
    };
  };

  // Order Details Review Workspace
  orderDetail: {
    breadcrumbsOrders: string;
    breadcrumbsDetail: string;
    backToOrders: string;
    generateXmlBtn: string;
    viewXmlBtn: string;
    reExtractBtn: string;
    autoFixBtn: string;
    completeness: string;
    confidence: string;
    docPreview: string;
    zoomIn: string;
    zoomOut: string;
    rotate: string;
    openInNewTab: string;
    tabs: {
      overview: string;
      buyer: string;
      order: string;
      delivery: string;
      lineItems: string;
      validation: string;
      auditTrail: string;
    };
    sections: {
      buyerInfo: string;
      orderInfo: string;
      deliveryInfo: string;
      lineItemsTitle: string;
      validationTitle: string;
      auditTrailTitle: string;
      rawDocumentContent: string;
      additionalDetails: string;
    };
    fields: {
      companyName: string;
      customerNumber: string;
      gln: string;
      vatId: string;
      contactPerson: string;
      email: string;
      phone: string;
      streetAddress: string;
      city: string;
      postalCode: string;
      country: string;
      poNumber: string;
      poDate: string;
      currency: string;
      paymentTerms: string;
      incoterms: string;
      orderReference: string;
      customerNotes: string;
      recipientName: string;
      deliveryLocation: string;
      requestedDeliveryDate: string;
      shippingMethod: string;
      unloadingPoint: string;
      sourceFileName: string;
      uploadedBy: string;
      receivedAt: string;
    };
    lineItems: {
      pos: string;
      customerArtNo: string;
      gebolArtNo: string;
      eanBarcode: string;
      description: string;
      quantity: string;
      unit: string;
      unitPrice: string;
      contractPrice: string;
      lineTotal: string;
      matchStatus: string;
      actions: string;
      mapped: string;
      unmapped: string;
      assignArticle: string;
      lookupArticle: string;
      autoMapped: string;
      priceMismatch: string;
      totalNet: string;
      totalVat: string;
      totalGross: string;
      positionsCount: string;
    };
    validation: {
      allPassed: string;
      rulesSummary: string;
      passed: string;
      failed: string;
      warnings: string;
      severityError: string;
      severityWarning: string;
      severityInfo: string;
      autoFixAvailable: string;
    };
    audit: {
      timestamp: string;
      user: string;
      action: string;
      details: string;
      category: string;
    };
    articleModal: {
      title: string;
      searchPlaceholder: string;
      selectBtn: string;
      cancelBtn: string;
      artNo: string;
      ean: string;
      name: string;
      price: string;
      unit: string;
    };
    validationMessages: {
      companyNameRequired: string;
      customerNumberRequired: string;
      glnRequired: string;
      deliveryLocationRequired: string;
      deliveryStreetRequired: string;
      poNumberRequired: string;
      requestedDeliveryDateRequired: string;
      articleMappingRequired: string;
      quantityRequired: string;
      validationErrorsDetected: string;
      xmlGeneratedSuccess: string;
    };
    unsavedChangesModal: {
      title: string;
      message: string;
      saveAndGenerateBtn: string;
      discardBtn: string;
      keepEditingBtn: string;
    };
  };

  // Upload Modal (POIntakeModal)
  uploadModal: {
    title: string;
    infoNotice: string;
    dropzoneTitle: string;
    dropzoneSubtitle: string;
    documentsHeader: string;
    removeFile: string;
    cancelBtn: string;
    uploadBtn: string;
    uploadingNotice: string;
    maxFilesError: string;
    unsupportedFormatError: string;
    corruptedFileError: string;
    encryptedFileError: string;
    emptySelectionError: string;
    successToastTitle: string;
    successToastMsg: string;
  };

  // Master Data - Customer Master
  customerMaster: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    exportBtn: string;
    importBtn: string;
    table: {
      customerNumber: string;
      companyName: string;
      gln: string;
      vatId: string;
      city: string;
      country: string;
      paymentTerms: string;
      contactPerson: string;
      actions: string;
    };
    filterModal: {
      title: string;
      countryLabel: string;
      cityLabel: string;
      resetBtn: string;
      applyBtn: string;
      cancelBtn: string;
    };
  };

  // Master Data - Article Master
  articleMaster: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    exportBtn: string;
    importBtn: string;
    table: {
      gebolArtNo: string;
      ean: string;
      description: string;
      category: string;
      unit: string;
      price: string;
      status: string;
      actions: string;
    };
    filterModal: {
      title: string;
      categoryLabel: string;
      unitLabel: string;
      resetBtn: string;
      applyBtn: string;
      cancelBtn: string;
    };
  };

  // User Management Screen
  userManagement: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    addUserBtn: string;
    filterBtn: string;
    importBtn: string;
    exportBtn: string;
    table: {
      email: string;
      role: string;
      action: string;
    };
    roles: {
      superUser: string;
      normalUser: string;
    };
    changeRoleBtn: string;
    resetPasswordBtn: string;
    deleteBtn: string;
    resetPasswordModal: {
      title: string;
      confirmPrompt: string;
      infoNotice: string;
      cancelBtn: string;
      confirmBtn: string;
    };
    tempPasswordModal: {
      title: string;
      subtitle: string;
      tempPasswordLabel: string;
      copyBtn: string;
      copiedNotice: string;
      shareNotice: string;
      forceChangeNotice: string;
      closeBtn: string;
    };
    addUserModal: {
      title: string;
      emailLabel: string;
      emailPlaceholder: string;
      roleLabel: string;
      infoNotice: string;
      cancelBtn: string;
      createBtn: string;
      successToast: string;
      duplicateError: string;
      invalidEmailError: string;
    };
    deleteModal: {
      title: string;
      confirmPrompt: string;
      warningText: string;
      cancelBtn: string;
      confirmBtn: string;
      successToast: string;
      selfDeleteBlocked: string;
      lastSuperUserBlocked: string;
    };
    changeRoleModal: {
      title: string;
      emailLabel: string;
      roleLabel: string;
      cancelBtn: string;
      saveBtn: string;
      successToast: string;
    };
    filterModal: {
      title: string;
      roleLabel: string;
      allRoles: string;
      resetBtn: string;
      applyBtn: string;
      cancelBtn: string;
    };
    importModal: {
      title: string;
      subtitle: string;
      downloadTemplate: string;
      selectPrompt: string;
      clickToSelect: string;
      selected: string;
      supportedFormat: string;
      mandatoryNotice: string;
      parsePreviewBtn: string;
      previewNotice: string;
      previewSubNotice: string;
      totalParsed: string;
      valid: string;
      invalid: string;
      backToFileSelection: string;
      saveAndReplace: string;
      saveDisabledWarning: string;
      cancelBtn: string;
      importBtn: string;
      successToast: string;
      errorNoValidRows: string;
      errorNoSuperUser: string;
      errorOnlyXlsx: string;
    };
    exportSuccessToast: string;
  };

  // Notifications
  notifications: {
    drawerTitle: string;
    unreadBadge: string;
    allCaughtUp: string;
    filterByLabel: string;
    allFilter: string;
    manualReviewFilter: string;
    processedFilter: string;
    processingFailureFilter: string;
    masterDataFilter: string;
    xmlFailureFilter: string;
    clearAll: string;
    close: string;
    emptyTitle: string;
    emptyDesc: string;
    dismiss: string;
    groupedReviewTitle: string;
    groupedReviewMsg: string;
    groupedReviewAction: string;
    groupedSuccessTitle: string;
    groupedSuccessMsg: string;
    groupedSuccessAction: string;
    processingFailureTitle: string;
    processingFailureMsg: string;
    processingFailureAction: string;
    masterDataTitle: string;
    masterDataMsg: string;
    masterDataAction: string;
    xmlFailureTitle: string;
    xmlFailureMsg: string;
    xmlFailureAction: string;
  };

  // XML Output Modal
  xmlModal: {
    title: string;
    subtitle: string;
    downloadBtn: string;
    transmitSapBtn: string;
    transmitting: string;
    transmittedSuccess: string;
    closeBtn: string;
  };

  // Login Screen
  login: {
    signIn: string;
    subtitle: string;
    emailAddress: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    signInBtn: string;
    signInWithMicrosoft: string;
    ssoNotice: string;
    copyright: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      orders: 'Orders',
      masterData: 'Master Data',
      customerMaster: 'Customer Master',
      articleMaster: 'Article Master',
      userManagement: 'User Management',
      uploadOrder: 'Upload Order',
      collapseSidebar: 'Collapse Sidebar',
      expandSidebar: 'Expand Sidebar',
      pendingCount: 'pending',
    },
    header: {
      notifications: 'Notifications',
      userProfile: 'User Profile',
      emailId: 'Email ID',
      role: 'Role',
      logOut: 'Log Out',
      language: 'Language',
      english: 'EN',
      german: 'DE',
    },
    status: {
      processing: 'Processing',
      needsReview: 'Needs Review',
      xmlGenerated: 'XML Generated',
      failed: 'Failed',
      completed: 'Completed',
      exported: 'Exported',
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
    },
    common: {
      search: 'Search',
      filter: 'Filter',
      filterBy: 'Filter by:',
      export: 'Export',
      import: 'Import',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      actions: 'Actions',
      back: 'Back',
      next: 'Next',
      apply: 'Apply',
      reset: 'Reset',
      confirm: 'Confirm',
      download: 'Download',
      view: 'View',
      viewDetails: 'View Details',
      upload: 'Upload',
      loading: 'Loading...',
      yes: 'Yes',
      no: 'No',
      retry: 'Retry',
      activeFilters: 'Active filters:',
      clearFilters: 'Clear filters',
      noDataFound: 'No records found',
      allCaughtUp: 'All caught up',
      recordsFound: 'records found',
      page: 'Page',
      of: 'of',
      showing: 'Showing',
      results: 'results',
    },
    orders: {
      title: 'Orders',
      subtitle: 'Manage purchase orders, review processing status, and access generated XML.',
      searchPlaceholder: 'Search by Order No., customer, or file name...',
      uploadOrderBtn: 'Upload Order',
      table: {
        orderId: 'Order / PO No.',
        customer: 'Customer / Buyer',
        sourceFile: 'Source File',
        sourceType: 'Source Type',
        receivedDate: 'Received Date',
        status: 'Status',
        completeness: 'Completeness',
        actions: 'Actions',
        generateXml: 'Generate XML',
        viewXml: 'View XML',
        deleteOrder: 'Delete Order',
      },
      filterModal: {
        title: 'Filter Orders',
        statusLabel: 'Status',
        customerLabel: 'Customer',
        uploadedByLabel: 'Uploaded By',
        dateModeLabel: 'Date Filter Mode',
        singleDate: 'Specific Date',
        dateRange: 'Date Range',
        dateLabel: 'Upload Date',
        fromDate: 'From Date',
        toDate: 'To Date',
        resetBtn: 'Reset Filters',
        applyBtn: 'Apply Filters',
        cancelBtn: 'Cancel',
      },
      stats: {
        total: 'Total Orders',
        needsReview: 'Needs Review',
        processing: 'Processing',
        xmlGenerated: 'XML Generated',
        failed: 'Failed',
      },
      confirmDelete: {
        title: 'Delete Order',
        message: 'Are you sure you want to delete this purchase order? This action cannot be undone.',
        confirmBtn: 'Delete',
        cancelBtn: 'Cancel',
      },
    },
    orderDetail: {
      breadcrumbsOrders: 'Orders',
      breadcrumbsDetail: 'Order Details',
      backToOrders: 'Back to Orders',
      generateXmlBtn: 'Save and Generate XML',
      viewXmlBtn: 'View XML',
      reExtractBtn: 'Re-extract AI',
      autoFixBtn: 'Auto-Resolve Rules',
      completeness: 'Completeness',
      confidence: 'AI Confidence',
      docPreview: 'Document Preview',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      rotate: 'Rotate',
      openInNewTab: 'Open in new tab',
      tabs: {
        overview: 'Overview',
        buyer: 'Buyer Information',
        order: 'Order Details',
        delivery: 'Delivery Address',
        lineItems: 'Line Items',
        validation: 'Validation Checks',
        auditTrail: 'Audit Trail',
      },
      sections: {
        buyerInfo: 'Buyer & Invoicing Information',
        orderInfo: 'Purchase Order Information',
        deliveryInfo: 'Delivery & Shipping Details',
        lineItemsTitle: 'Order Line Items',
        validationTitle: 'Validation & Quality Rules',
        auditTrailTitle: 'Audit & Transaction History',
        rawDocumentContent: 'Extracted Raw Document Text',
        additionalDetails: 'Additional Notes & Comments',
      },
      fields: {
        companyName: 'Company Name',
        customerNumber: 'Customer No. (GP Nr)',
        gln: 'GLN / ILN',
        vatId: 'VAT Registration ID',
        contactPerson: 'Contact Person',
        email: 'Email Address',
        phone: 'Telephone',
        streetAddress: 'Street Address',
        city: 'City',
        postalCode: 'Postal Code',
        country: 'Country',
        poNumber: 'PO Number',
        poDate: 'PO Date',
        currency: 'Currency',
        paymentTerms: 'Payment Terms',
        incoterms: 'Incoterms',
        orderReference: 'Order Reference',
        customerNotes: 'Customer Notes',
        recipientName: 'Recipient / Facility',
        deliveryLocation: 'Delivery Location',
        requestedDeliveryDate: 'Requested Delivery Date',
        shippingMethod: 'Shipping Method',
        unloadingPoint: 'Unloading Point',
        sourceFileName: 'Source File Name',
        uploadedBy: 'Uploaded By',
        receivedAt: 'Received At',
      },
      lineItems: {
        pos: 'Pos.',
        customerArtNo: 'Customer Art. No.',
        gebolArtNo: 'GEBOL Art. No.',
        eanBarcode: 'EAN / Barcode',
        description: 'Description',
        quantity: 'Quantity',
        unit: 'Unit',
        unitPrice: 'Unit Price',
        contractPrice: 'List Price',
        lineTotal: 'Line Total',
        matchStatus: 'Match Status',
        actions: 'Actions',
        mapped: 'Matched',
        unmapped: 'Unmapped',
        assignArticle: 'Assign Article',
        lookupArticle: 'Lookup GEBOL Article',
        autoMapped: 'Auto-Matched',
        priceMismatch: 'Price Variance',
        totalNet: 'Total Net Amount',
        totalVat: 'VAT Amount',
        totalGross: 'Total Gross Amount',
        positionsCount: 'Positions',
      },
      validation: {
        allPassed: 'All validation rules passed successfully',
        rulesSummary: 'Validation Summary',
        passed: 'Passed',
        failed: 'Failed',
        warnings: 'Warnings',
        severityError: 'Error',
        severityWarning: 'Warning',
        severityInfo: 'Info',
        autoFixAvailable: 'Auto-fix available',
      },
      audit: {
        timestamp: 'Timestamp',
        user: 'User / Actor',
        action: 'Action',
        details: 'Details',
        category: 'Category',
      },
      articleModal: {
        title: 'Assign GEBOL Article',
        searchPlaceholder: 'Search by article number, EAN barcode, or product name...',
        selectBtn: 'Assign Article',
        cancelBtn: 'Cancel',
        artNo: 'GEBOL Art. No.',
        ean: 'EAN',
        name: 'Product Name',
        price: 'Master Price',
        unit: 'Unit',
      },
      validationMessages: {
        companyNameRequired: 'Customer company name is required',
        customerNumberRequired: 'Customer GP number is required',
        glnRequired: 'Customer GLN is required',
        deliveryLocationRequired: 'Delivery location is required',
        deliveryStreetRequired: 'Delivery address is required',
        poNumberRequired: 'Purchase Order number is required',
        requestedDeliveryDateRequired: 'Delivery date is required',
        articleMappingRequired: 'GEBOL Art.No. or EAN required',
        quantityRequired: 'Quantity must be > 0',
        validationErrorsDetected: 'Please correct highlighted errors before generating XML.',
        xmlGeneratedSuccess: 'XML generated and downloaded successfully.',
      },
      unsavedChangesModal: {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes on this order. Do you want to save and generate XML or discard your changes?',
        saveAndGenerateBtn: 'Save and Generate XML',
        discardBtn: 'Discard Changes',
        keepEditingBtn: 'Keep Editing',
      },
    },
    uploadModal: {
      title: 'Upload Order',
      infoNotice: 'Up to 10 files can be uploaded at once. Supported formats: PDF, XML, Excel (.xlsx, .xls).',
      dropzoneTitle: 'Drag & Drop Purchase Orders here or click to browse',
      dropzoneSubtitle: 'Upload up to 10 files at once (PDF, XML, Excel .xlsx)',
      documentsHeader: 'Selected Documents',
      removeFile: 'Remove file',
      cancelBtn: 'Cancel',
      uploadBtn: 'Upload',
      uploadingNotice: 'Adding order(s) to processing queue...',
      maxFilesError: 'Maximum 10 files can be uploaded at once. Please reduce your selection.',
      unsupportedFormatError: 'Unsupported format. Please upload PDF, Excel (.xls, .xlsx), or XML files.',
      corruptedFileError: 'Corrupted file detected. Please upload a valid document.',
      encryptedFileError: 'Password-protected files are not supported. Please remove encryption.',
      emptySelectionError: 'Please select or drop at least one purchase order document to upload.',
      successToastTitle: 'Upload Successful',
      successToastMsg: 'purchase order(s) added for processing.',
    },
    customerMaster: {
      title: 'Customer Master',
      subtitle: 'Manage master customer profiles, GLN routing, and ERP mapping accounts.',
      searchPlaceholder: 'Search customers by name, customer number, GLN, or city...',
      exportBtn: 'Export',
      importBtn: 'Import',
      table: {
        customerNumber: 'Customer No. (GP)',
        companyName: 'Company Name',
        gln: 'GLN / ILN',
        vatId: 'VAT Registration ID',
        city: 'City',
        country: 'Country',
        paymentTerms: 'Payment Terms',
        contactPerson: 'Contact Person',
        actions: 'Actions',
      },
      filterModal: {
        title: 'Filter Customer Master',
        countryLabel: 'Country',
        cityLabel: 'City',
        resetBtn: 'Reset Filters',
        applyBtn: 'Apply Filters',
        cancelBtn: 'Cancel',
      },
    },
    articleMaster: {
      title: 'Article Master',
      subtitle: 'Manage GEBOL product catalog, EAN barcodes, packaging units, and master price lists.',
      searchPlaceholder: 'Search articles by GEBOL Art. No., EAN, or description...',
      exportBtn: 'Export',
      importBtn: 'Import',
      table: {
        gebolArtNo: 'GEBOL Art. No.',
        ean: 'EAN Barcode',
        description: 'Description',
        category: 'Category',
        unit: 'Unit',
        price: 'List Price (€)',
        status: 'Status',
        actions: 'Actions',
      },
      filterModal: {
        title: 'Filter Article Master',
        categoryLabel: 'Category',
        unitLabel: 'Packaging Unit',
        resetBtn: 'Reset Filters',
        applyBtn: 'Apply Filters',
        cancelBtn: 'Cancel',
      },
    },
    userManagement: {
      title: 'User Management',
      subtitle: 'Manage application users and their roles.',
      searchPlaceholder: 'Search by email address or role...',
      addUserBtn: 'Add User',
      filterBtn: 'Filter',
      importBtn: 'Import',
      exportBtn: 'Export',
      table: {
        email: 'Email Address',
        role: 'Role',
        action: 'Action',
      },
      roles: {
        superUser: 'Super User',
        normalUser: 'Normal User',
      },
      changeRoleBtn: 'Change Role',
      resetPasswordBtn: 'Reset Password',
      deleteBtn: 'Delete',
      resetPasswordModal: {
        title: 'Reset User Password',
        confirmPrompt: 'Are you sure you want to reset the password for {email}?',
        infoNotice: 'On confirmation, a secure temporary password will be generated. The user must set a new password upon their next login.',
        cancelBtn: 'Cancel',
        confirmBtn: 'Reset Password',
      },
      tempPasswordModal: {
        title: 'Password Reset Successful',
        subtitle: 'A temporary password has been generated for {email}.',
        tempPasswordLabel: 'Temporary Password',
        copyBtn: 'Copy Password',
        copiedNotice: 'Password copied to clipboard!',
        shareNotice: 'Share this temporary password securely with the user.',
        forceChangeNotice: 'The user will be required to create a new password after logging in.',
        closeBtn: 'Done',
      },
      addUserModal: {
        title: 'Add New User',
        emailLabel: 'Email Address',
        emailPlaceholder: 'e.g. name@gebol.at',
        roleLabel: 'Role',
        infoNotice: 'No password required. On creation, the system will send an account-creation invitation link to the user email.',
        cancelBtn: 'Cancel',
        createBtn: 'Create User',
        successToast: 'User created successfully. Account-creation email link has been sent.',
        duplicateError: 'A user with this email address already exists.',
        invalidEmailError: 'Please enter a valid email address.',
      },
      deleteModal: {
        title: 'Delete User',
        confirmPrompt: 'Are you sure you want to delete user {email}?',
        warningText: 'This action cannot be undone and will permanently remove this user account.',
        cancelBtn: 'Cancel',
        confirmBtn: 'Delete User',
        successToast: 'User has been successfully deleted.',
        selfDeleteBlocked: 'You cannot delete your own account.',
        lastSuperUserBlocked: 'Cannot delete the only Super User. The system must retain at least one Super User.',
      },
      changeRoleModal: {
        title: 'Change User Role',
        emailLabel: 'Email Address',
        roleLabel: 'Role',
        cancelBtn: 'Cancel',
        saveBtn: 'Save Changes',
        successToast: 'User role updated successfully.',
      },
      filterModal: {
        title: 'Filter Users',
        roleLabel: 'Role',
        allRoles: 'All Roles',
        resetBtn: 'Reset Filters',
        applyBtn: 'Apply Filters',
        cancelBtn: 'Cancel',
      },
      importModal: {
        title: 'Import User Master Dataset',
        subtitle: 'Upload an Excel (.xlsx) file containing Email and Role columns.',
        downloadTemplate: 'Download Sample Template (.xlsx)',
        selectPrompt: 'Select or drag an Excel spreadsheet (.xlsx only) to parse:',
        clickToSelect: 'Click here to select an Excel (.xlsx) file',
        selected: 'Selected:',
        supportedFormat: 'Supported format: Excel (.xlsx only)',
        mandatoryNotice: 'Mandatory columns: Email (or Email Address) and Role. Import is a full replacement.',
        parsePreviewBtn: 'Parse & Preview Data',
        previewNotice: '* Full Replacement: Importing this file will replace all existing users once validated.',
        previewSubNotice: 'If any row fails validation, your existing user list remains untouched. File must include at least one Super User.',
        totalParsed: 'Total Parsed:',
        valid: 'Valid',
        invalid: 'Invalid',
        backToFileSelection: 'Back to File Selection',
        saveAndReplace: 'Save & Replace All Users',
        saveDisabledWarning: 'Replacement disabled: Validation errors detected. All rows must be valid and contain at least one Super User.',
        cancelBtn: 'Cancel',
        importBtn: 'Import Users',
        successToast: 'User master successfully replaced with imported dataset.',
        errorNoValidRows: 'No valid user records found in the uploaded file.',
        errorNoSuperUser: 'Validation failed: The imported file must contain at least one Super User.',
        errorOnlyXlsx: 'Only Excel (.xlsx) files are accepted for user import.',
      },
      exportSuccessToast: 'User list exported successfully.',
    },

    notifications: {
      drawerTitle: 'Notifications',
      unreadBadge: 'unread',
      allCaughtUp: 'All caught up',
      filterByLabel: 'Filter by:',
      allFilter: 'All Notifications',
      manualReviewFilter: 'Manual Review Required',
      processedFilter: 'Processed Successfully',
      processingFailureFilter: 'Processing Failures',
      masterDataFilter: 'Master Data Uploads',
      xmlFailureFilter: 'XML Generation Failures',
      clearAll: 'Clear all',
      close: 'Close',
      emptyTitle: 'No notifications found',
      emptyDesc: 'There are no notifications matching the selected filter.',
      dismiss: 'Dismiss',
      groupedReviewTitle: '3 documents need manual review',
      groupedReviewMsg: '3 documents (PO-2026-80635109, PO-2026-88102, PO-2026-88107) need manual review due to unmapped customer articles.',
      groupedReviewAction: 'Review Orders',
      groupedSuccessTitle: '3 orders are processed successfully',
      groupedSuccessMsg: '3 orders (PO-2026-88101, PO-2026-88103, PO-2026-88105) are processed successfully and ready for ERP integration.',
      groupedSuccessAction: 'View Orders',
      processingFailureTitle: 'Order document processing failed',
      processingFailureMsg: 'We were unable to process the uploaded order document. Please check the document format and retry processing.',
      processingFailureAction: 'Retry Processing',
      masterDataTitle: 'Master Data Upload',
      masterDataMsg: 'Customer Master dataset was successfully updated via Excel import.',
      masterDataAction: 'View Master Data',
      xmlFailureTitle: 'XML generation failed: EDI_88104.xml',
      xmlFailureMsg: 'XML generation timed out due to high system load. The EDI file could not be generated.',
      xmlFailureAction: 'Review Order',
    },
    xmlModal: {
      title: 'GEBOL ERP XML Export',
      subtitle: 'Standardized EDI XML message generated for automated SAP Gateway ingestion.',
      downloadBtn: 'Download XML File',
      transmitSapBtn: 'Transmit to SAP ERP',
      transmitting: 'Transmitting to SAP Gateway...',
      transmittedSuccess: 'Transmitted Successfully',
      closeBtn: 'Close',
    },
    login: {
      signIn: 'Sign In',
      subtitle: 'Sign in to your GEBOL account',
      emailAddress: 'Email Address',
      password: 'Password',
      emailPlaceholder: 'name@gebol.at',
      passwordPlaceholder: '••••••••••••',
      emailRequired: 'Please enter your email address.',
      emailInvalid: 'Please enter a valid email address.',
      passwordRequired: 'Please enter your password.',
      signInBtn: 'Sign In',
      signInWithMicrosoft: 'Sign in with Microsoft',
      ssoNotice: 'Secure Single Sign-On for GEBOL enterprise accounts',
      copyright: 'All Rights Reserved',
    },
  },
  de: {
    nav: {
      orders: 'Aufträge',
      masterData: 'Stammdaten',
      customerMaster: 'Kundenstamm',
      articleMaster: 'Artikelstamm',
      userManagement: 'Benutzerverwaltung',
      uploadOrder: 'Auftrag hochladen',
      collapseSidebar: 'Seitenleiste einklappen',
      expandSidebar: 'Seitenleiste ausklappen',
      pendingCount: 'ausstehend',
    },
    header: {
      notifications: 'Benachrichtigungen',
      userProfile: 'Benutzerprofil',
      emailId: 'E-Mail-Adresse',
      role: 'Rolle',
      logOut: 'Abmelden',
      language: 'Sprache',
      english: 'EN',
      german: 'DE',
    },
    status: {
      processing: 'In Bearbeitung',
      needsReview: 'Prüfung erforderlich',
      xmlGenerated: 'XML generiert',
      failed: 'Fehlgeschlagen',
      completed: 'Abgeschlossen',
      exported: 'Exportiert',
      all: 'Alle',
      active: 'Aktiv',
      inactive: 'Inaktiv',
    },
    common: {
      search: 'Suchen',
      filter: 'Filter',
      filterBy: 'Filtern nach:',
      export: 'Exportieren',
      import: 'Importieren',
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schließen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      actions: 'Aktionen',
      back: 'Zurück',
      next: 'Weiter',
      apply: 'Anwenden',
      reset: 'Zurücksetzen',
      confirm: 'Bestätigen',
      download: 'Herunterladen',
      view: 'Anzeigen',
      viewDetails: 'Details anzeigen',
      upload: 'Hochladen',
      loading: 'Wird geladen...',
      yes: 'Ja',
      no: 'Nein',
      retry: 'Wiederholen',
      activeFilters: 'Aktive Filter:',
      clearFilters: 'Filter löschen',
      noDataFound: 'Keine Datensätze gefunden',
      allCaughtUp: 'Alles auf dem neuesten Stand',
      recordsFound: 'Einträge gefunden',
      page: 'Seite',
      of: 'von',
      showing: 'Zeige',
      results: 'Ergebnisse',
    },
    orders: {
      title: 'Aufträge',
      subtitle: 'Verwalten Sie Kundenbestellungen, prüfen Sie den Verarbeitungsstatus und greifen Sie auf generierte XML-Daten zu.',
      searchPlaceholder: 'Nach Bestell-Nr., Kunde oder Dateiname suchen...',
      uploadOrderBtn: 'Auftrag hochladen',
      table: {
        orderId: 'Bestell-Nr. / Auftrags-ID',
        customer: 'Kunde / Käufer',
        sourceFile: 'Quelldatei',
        sourceType: 'Quelltyp',
        receivedDate: 'Eingangsdatum',
        status: 'Status',
        completeness: 'Vollständigkeit',
        actions: 'Aktionen',
        generateXml: 'XML generieren',
        viewXml: 'XML anzeigen',
        deleteOrder: 'Auftrag löschen',
      },
      filterModal: {
        title: 'Aufträge filtern',
        statusLabel: 'Status',
        customerLabel: 'Kunde',
        uploadedByLabel: 'Hochgeladen von',
        dateModeLabel: 'Datumsfilter-Modus',
        singleDate: 'Bestimmtes Datum',
        dateRange: 'Datumsbereich',
        dateLabel: 'Upload-Datum',
        fromDate: 'Von Datum',
        toDate: 'Bis Datum',
        resetBtn: 'Filter zurücksetzen',
        applyBtn: 'Filter anwenden',
        cancelBtn: 'Abbrechen',
      },
      stats: {
        total: 'Aufträge gesamt',
        needsReview: 'Prüfung erforderlich',
        processing: 'In Bearbeitung',
        xmlGenerated: 'XML generiert',
        failed: 'Fehlgeschlagen',
      },
      confirmDelete: {
        title: 'Auftrag löschen',
        message: 'Möchten Sie diese Bestellung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        confirmBtn: 'Löschen',
        cancelBtn: 'Abbrechen',
      },
    },
    orderDetail: {
      breadcrumbsOrders: 'Aufträge',
      breadcrumbsDetail: 'Auftragsdetails',
      backToOrders: 'Zurück zur Übersicht',
      generateXmlBtn: 'Speichern & XML generieren',
      viewXmlBtn: 'XML anzeigen',
      reExtractBtn: 'KI-Analyse wiederholen',
      autoFixBtn: 'Regeln automatisch bereinigen',
      completeness: 'Vollständigkeit',
      confidence: 'KI-Zuverlässigkeit',
      docPreview: 'Dokumentenvorschau',
      zoomIn: 'Vergrößern',
      zoomOut: 'Verkleinern',
      rotate: 'Drehen',
      openInNewTab: 'In neuem Tab öffnen',
      tabs: {
        overview: 'Übersicht',
        buyer: 'Käuferdaten',
        order: 'Bestelldaten',
        delivery: 'Lieferadresse',
        lineItems: 'Positionen',
        validation: 'Validierungsprüfung',
        auditTrail: 'Änderungshistorie',
      },
      sections: {
        buyerInfo: 'Käufer- & Rechnungsinformationen',
        orderInfo: 'Bestell- & Konditionsdaten',
        deliveryInfo: 'Liefer- & Versandinformationen',
        lineItemsTitle: 'Auftragspositionen',
        validationTitle: 'Validierungs- & Qualitätsregeln',
        auditTrailTitle: 'Audit- & Transaktionsprotokoll',
        rawDocumentContent: 'Extrahierter Dokumententext',
        additionalDetails: 'Zusätzliche Hinweise & Bemerkungen',
      },
      fields: {
        companyName: 'Firmenname',
        customerNumber: 'Kundennummer (GP-Nr.)',
        gln: 'GLN / ILN',
        vatId: 'USt-IdNr. / UID',
        contactPerson: 'Ansprechpartner',
        email: 'E-Mail-Adresse',
        phone: 'Telefonnummer',
        streetAddress: 'Straße & Hausnummer',
        city: 'Ort',
        postalCode: 'Postleitzahl',
        country: 'Land',
        poNumber: 'Bestellnummer',
        poDate: 'Bestelldatum',
        currency: 'Währung',
        paymentTerms: 'Zahlungsbedingungen',
        incoterms: 'Lieferbedingungen (Incoterms)',
        orderReference: 'Auftragsreferenz',
        customerNotes: 'Kundenhinweise',
        recipientName: 'Empfänger / Filiale',
        deliveryLocation: 'Lieferort',
        requestedDeliveryDate: 'Wunschlieferdatum',
        shippingMethod: 'Versandart',
        unloadingPoint: 'Abladestelle',
        sourceFileName: 'Quelldateiname',
        uploadedBy: 'Hochgeladen von',
        receivedAt: 'Empfangen am',
      },
      lineItems: {
        pos: 'Pos.',
        customerArtNo: 'Kunden-Art.-Nr.',
        gebolArtNo: 'GEBOL-Art.-Nr.',
        eanBarcode: 'EAN / Barcode',
        description: 'Artikelbezeichnung',
        quantity: 'Menge',
        unit: 'Einheit',
        unitPrice: 'Einzelpreis',
        contractPrice: 'Listenpreis',
        lineTotal: 'Gesamtpreis',
        matchStatus: 'Zuordnungsstatus',
        actions: 'Aktionen',
        mapped: 'Zugeordnet',
        unmapped: 'Nicht zugeordnet',
        assignArticle: 'Artikel zuweisen',
        lookupArticle: 'GEBOL-Artikel suchen',
        autoMapped: 'Automatisch gemappt',
        priceMismatch: 'Preisabweichung',
        totalNet: 'Gesamt-Nettobetrag',
        totalVat: 'Umsatzsteuer',
        totalGross: 'Gesamt-Bruttobetrag',
        positionsCount: 'Positionen',
      },
      validation: {
        allPassed: 'Alle Validierungsprüfungen erfolgreich bestanden',
        rulesSummary: 'Prüfungsübersicht',
        passed: 'Bestanden',
        failed: 'Fehlgeschlagen',
        warnings: 'Warnungen',
        severityError: 'Fehler',
        severityWarning: 'Warnung',
        severityInfo: 'Hinweis',
        autoFixAvailable: 'Automatische Behebung verfügbar',
      },
      audit: {
        timestamp: 'Zeitstempel',
        user: 'Benutzer / System',
        action: 'Aktion',
        details: 'Details',
        category: 'Kategorie',
      },
      articleModal: {
        title: 'GEBOL-Artikel zuweisen',
        searchPlaceholder: 'Nach Artikelnummer, EAN-Barcode oder Produktbezeichnung suchen...',
        selectBtn: 'Artikel zuweisen',
        cancelBtn: 'Abbrechen',
        artNo: 'GEBOL-Art.-Nr.',
        ean: 'EAN',
        name: 'Produktbezeichnung',
        price: 'Listenpreis',
        unit: 'Einheit',
      },
      validationMessages: {
        companyNameRequired: 'Kundenname ist erforderlich',
        customerNumberRequired: 'Kunden-GP-Nummer ist erforderlich',
        glnRequired: 'Kunden-GLN ist erforderlich',
        deliveryLocationRequired: 'Lieferort ist erforderlich',
        deliveryStreetRequired: 'Lieferadresse ist erforderlich',
        poNumberRequired: 'Bestellnummer (PO) ist erforderlich',
        requestedDeliveryDateRequired: 'Lieferdatum ist erforderlich',
        articleMappingRequired: 'GEBOL-Art.-Nr. oder EAN erforderlich',
        quantityRequired: 'Menge muss > 0 sein',
        validationErrorsDetected: 'Bitte beheben Sie die markierten Validierungsfehler vor der XML-Erstellung.',
        xmlGeneratedSuccess: 'XML erfolgreich generiert und heruntergeladen.',
      },
      unsavedChangesModal: {
        title: 'Ungespeicherte Änderungen',
        message: 'Sie haben ungespeicherte Änderungen an diesem Auftrag vorgenommen. Möchten Sie speichern & XML generieren oder die Änderungen verwerfen?',
        saveAndGenerateBtn: 'Speichern & XML generieren',
        discardBtn: 'Änderungen verwerfen',
        keepEditingBtn: 'Weiter bearbeiten',
      },
    },
    uploadModal: {
      title: 'Auftrag hochladen',
      infoNotice: 'Es können bis zu 10 Dateien gleichzeitig hochgeladen werden. Unterstützte Formate: PDF, XML, Excel (.xlsx, .xls).',
      dropzoneTitle: 'Bestellungen hierher ziehen oder klicken zum Auswählen',
      dropzoneSubtitle: 'Bis zu 10 Dateien gleichzeitig hochladen (PDF, XML, Excel .xlsx)',
      documentsHeader: 'Ausgewählte Dokumente',
      removeFile: 'Datei entfernen',
      cancelBtn: 'Abbrechen',
      uploadBtn: 'Hochladen',
      uploadingNotice: 'Auftrag/Aufträge werden zur Verarbeitungswarteschlange hinzugefügt...',
      maxFilesError: 'Es können maximal 10 Dateien gleichzeitig hochgeladen werden. Bitte reduzieren Sie Ihre Auswahl.',
      unsupportedFormatError: 'Nicht unterstütztes Format. Bitte laden Sie PDF, Excel (.xls, .xlsx) oder XML-Dateien hoch.',
      corruptedFileError: 'Beschädigte Datei erkannt. Bitte laden Sie ein gültiges Dokument hoch.',
      encryptedFileError: 'Passwortgeschützte Dateien werden nicht unterstützt. Bitte entfernen Sie den Kennwortschutz.',
      emptySelectionError: 'Bitte wählen Sie mindestens ein Bestelldokument zum Hochladen aus.',
      successToastTitle: 'Upload erfolgreich',
      successToastMsg: 'Bestellung(en) zur Verarbeitung hinzugefügt.',
    },
    customerMaster: {
      title: 'Kundenstamm',
      subtitle: 'Verwalten Sie Kunden-Stammdaten, GLN-Routing und ERP-Zuordnungskonten.',
      searchPlaceholder: 'Kunden nach Name, Kundennummer, GLN oder Ort durchsuchen...',
      exportBtn: 'Exportieren',
      importBtn: 'Importieren',
      table: {
        customerNumber: 'Kundennummer (GP)',
        companyName: 'Firmenname',
        gln: 'GLN / ILN',
        vatId: 'USt-IdNr. / UID',
        city: 'Ort',
        country: 'Land',
        paymentTerms: 'Zahlungsbedingungen',
        contactPerson: 'Ansprechpartner',
        actions: 'Aktionen',
      },
      filterModal: {
        title: 'Kundenstamm filtern',
        countryLabel: 'Land',
        cityLabel: 'Ort',
        resetBtn: 'Filter zurücksetzen',
        applyBtn: 'Filter anwenden',
        cancelBtn: 'Abbrechen',
      },
    },
    articleMaster: {
      title: 'Artikelstamm',
      subtitle: 'Verwalten Sie den GEBOL-Produktkatalog, EAN-Barcodes, Verpackungseinheiten und Master-Preislisten.',
      searchPlaceholder: 'Artikel nach GEBOL-Art.-Nr., EAN oder Bezeichnung suchen...',
      exportBtn: 'Exportieren',
      importBtn: 'Importieren',
      table: {
        gebolArtNo: 'GEBOL-Art.-Nr.',
        ean: 'EAN-Barcode',
        description: 'Bezeichnung',
        category: 'Kategorie',
        unit: 'Mengeneinheit',
        price: 'Listenpreis (€)',
        status: 'Status',
        actions: 'Aktionen',
      },
      filterModal: {
        title: 'Artikelstamm filtern',
        categoryLabel: 'Kategorie',
        unitLabel: 'Verpackungseinheit',
        resetBtn: 'Filter zurücksetzen',
        applyBtn: 'Filter anwenden',
        cancelBtn: 'Abbrechen',
      },
    },
    userManagement: {
      title: 'Benutzerverwaltung',
      subtitle: 'Verwalten Sie Anwendungsbenutzer und deren Rollen.',
      searchPlaceholder: 'Nach E-Mail-Adresse oder Rolle suchen...',
      addUserBtn: 'Benutzer hinzufügen',
      filterBtn: 'Filter',
      importBtn: 'Importieren',
      exportBtn: 'Exportieren',
      table: {
        email: 'E-Mail-Adresse',
        role: 'Rolle',
        action: 'Aktion',
      },
      roles: {
        superUser: 'Superuser',
        normalUser: 'Standardbenutzer',
      },
      changeRoleBtn: 'Rolle ändern',
      resetPasswordBtn: 'Passwort zurücksetzen',
      deleteBtn: 'Löschen',
      resetPasswordModal: {
        title: 'Benutzerpasswort zurücksetzen',
        confirmPrompt: 'Möchten Sie das Passwort für {email} wirklich zurücksetzen?',
        infoNotice: 'Nach Bestätigung wird ein sicheres temporäres Passwort generiert. Der Benutzer muss sich bei der nächsten Anmeldung ein neues Passwort erstellen.',
        cancelBtn: 'Abbrechen',
        confirmBtn: 'Passwort zurücksetzen',
      },
      tempPasswordModal: {
        title: 'Passwort-Reset erfolgreich',
        subtitle: 'Ein temporäres Passwort wurde für {email} generiert.',
        tempPasswordLabel: 'Temporäres Passwort',
        copyBtn: 'Passwort kopieren',
        copiedNotice: 'Passwort in die Zwischenablage kopiert!',
        shareNotice: 'Geben Sie dieses temporäre Passwort sicher an den Benutzer weiter.',
        forceChangeNotice: 'Der Benutzer muss nach der Anmeldung ein neues Passwort erstellen.',
        closeBtn: 'Fertig',
      },
      addUserModal: {
        title: 'Neuen Benutzer hinzufügen',
        emailLabel: 'E-Mail-Adresse',
        emailPlaceholder: 'z.B. name@gebol.at',
        roleLabel: 'Rolle',
        infoNotice: 'Kein Passwort erforderlich. Bei der Erstellung sendet das System einen Einladungslink zur Kontoerstellung an die E-Mail-Adresse.',
        cancelBtn: 'Abbrechen',
        createBtn: 'Benutzer erstellen',
        successToast: 'Benutzer erfolgreich erstellt. Kontoerstellungslink wurde versendet.',
        duplicateError: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.',
        invalidEmailError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      },
      deleteModal: {
        title: 'Benutzer löschen',
        confirmPrompt: 'Sind Sie sicher, dass Sie den Benutzer {email} löschen möchten?',
        warningText: 'Diese Aktion kann nicht rückgängig gemacht werden und entfernt dieses Benutzerkonto dauerhaft.',
        cancelBtn: 'Abbrechen',
        confirmBtn: 'Benutzer löschen',
        successToast: 'Benutzer wurde erfolgreich gelöscht.',
        selfDeleteBlocked: 'Sie können Ihr eigenes Konto nicht löschen.',
        lastSuperUserBlocked: 'Der einzige Superuser kann nicht gelöscht werden. Das System benötigt mindestens einen Superuser.',
      },
      changeRoleModal: {
        title: 'Benutzerrolle ändern',
        emailLabel: 'E-Mail-Adresse',
        roleLabel: 'Rolle',
        cancelBtn: 'Abbrechen',
        saveBtn: 'Änderungen speichern',
        successToast: 'Benutzerrolle erfolgreich aktualisiert.',
      },
      filterModal: {
        title: 'Benutzer filtern',
        roleLabel: 'Rolle',
        allRoles: 'Alle Rollen',
        resetBtn: 'Filter zurücksetzen',
        applyBtn: 'Filter anwenden',
        cancelBtn: 'Abbrechen',
      },
      importModal: {
        title: 'Benutzerstamm-Datensatz importieren',
        subtitle: 'Laden Sie eine Excel-Datei (.xlsx) mit den Spalten Email und Role hoch.',
        downloadTemplate: 'Beispielvorlage herunterladen (.xlsx)',
        selectPrompt: 'Wählen oder ziehen Sie eine Excel-Tabelle (.xlsx) zum Verarbeiten:',
        clickToSelect: 'Hier klicken, um eine Excel-Datei (.xlsx) auszuwählen',
        selected: 'Ausgewählt:',
        supportedFormat: 'Unterstütztes Format: Excel (.xlsx)',
        mandatoryNotice: 'Pflichtspalten: Email und Role. Der Import ersetzt alle bestehenden Benutzer vollständig.',
        parsePreviewBtn: 'Daten verarbeiten & Vorschau',
        previewNotice: '* Vollständiger Ersatz: Der Import ersetzt nach erfolgreicher Validierung alle Benutzer.',
        previewSubNotice: 'Falls eine Zeile ungültig ist, bleibt die bestehende Benutzerliste unverändert. Mindestens ein Superuser erforderlich.',
        totalParsed: 'Gesamt verarbeitet:',
        valid: 'Gültig',
        invalid: 'Ungültig',
        backToFileSelection: 'Zurück zur Dateiauswahl',
        saveAndReplace: 'Alle Benutzer ersetzen & speichern',
        saveDisabledWarning: 'Speichern deaktiviert: Validierungsfehler erkannt. Alle Zeilen müssen gültig sein und mindestens ein Superuser enthalten sein.',
        cancelBtn: 'Abbrechen',
        importBtn: 'Benutzer importieren',
        successToast: 'Benutzerstamm erfolgreich durch Importdatei ersetzt.',
        errorNoValidRows: 'Keine gültigen Benutzerdatensätze in der hochgeladenen Datei gefunden.',
        errorNoSuperUser: 'Validierung fehlgeschlagen: Die Importdatei muss mindestens einen Superuser enthalten.',
        errorOnlyXlsx: 'Nur Excel-Dateien (.xlsx) werden für den Benutzerimport akzeptiert.',
      },
      exportSuccessToast: 'Benutzerliste erfolgreich exportiert.',
    },

    notifications: {
      drawerTitle: 'Benachrichtigungen',
      unreadBadge: 'ungelesen',
      allCaughtUp: 'Alles auf dem neuesten Stand',
      filterByLabel: 'Filtern nach:',
      allFilter: 'Alle Benachrichtigungen',
      manualReviewFilter: 'Manuelle Prüfung erforderlich',
      processedFilter: 'Erfolgreich verarbeitet',
      processingFailureFilter: 'Verarbeitungsfehler',
      masterDataFilter: 'Stammdaten-Uploads',
      xmlFailureFilter: 'XML-Generierungsfehler',
      clearAll: 'Alle löschen',
      close: 'Schließen',
      emptyTitle: 'Keine Benachrichtigungen gefunden',
      emptyDesc: 'Es liegen keine Meldungen für den ausgewählten Filter vor.',
      dismiss: 'Ausblenden',
      groupedReviewTitle: '3 Dokumente erfordern manuelle Prüfung',
      groupedReviewMsg: '3 Dokumente (PO-2026-80635109, PO-2026-88102, PO-2026-88107) erfordern eine manuelle Prüfung aufgrund nicht zugeordneter Artikel.',
      groupedReviewAction: 'Aufträge prüfen',
      groupedSuccessTitle: '3 Aufträge erfolgreich verarbeitet',
      groupedSuccessMsg: '3 Aufträge (PO-2026-88101, PO-2026-88103, PO-2026-88105) wurden erfolgreich verarbeitet und sind bereit für die ERP-Übertragung.',
      groupedSuccessAction: 'Aufträge anzeigen',
      processingFailureTitle: 'Auftragsverarbeitung fehlgeschlagen',
      processingFailureMsg: 'Das hochgeladene Bestelldokument konnte nicht verarbeitet werden. Bitte prüfen Sie das Dateiformat und versuchen Sie es erneut.',
      processingFailureAction: 'Verarbeitung wiederholen',
      masterDataTitle: 'Stammdaten-Upload',
      masterDataMsg: 'Der Kundenstammdatensatz wurde erfolgreich via Excel-Import aktualisiert.',
      masterDataAction: 'Stammdaten anzeigen',
      xmlFailureTitle: 'XML-Generierung fehlgeschlagen: EDI_88104.xml',
      xmlFailureMsg: 'Die XML-Generierung wurde aufgrund hoher Systemauslastung abgebrochen. Die EDI-Datei konnte nicht erstellt werden.',
      xmlFailureAction: 'Auftrag prüfen',
    },
    xmlModal: {
      title: 'GEBOL ERP XML-Export',
      subtitle: 'Standardisierte EDI XML-Nachricht generiert für den automatisierten SAP Gateway-Import.',
      downloadBtn: 'XML-Datei herunterladen',
      transmitSapBtn: 'An SAP ERP übertragen',
      transmitting: 'Wird an SAP Gateway übertragen...',
      transmittedSuccess: 'Erfolgreich übertragen',
      closeBtn: 'Schließen',
    },
    login: {
      signIn: 'Anmelden',
      subtitle: 'Melden Sie sich bei Ihrem GEBOL-Konto an',
      emailAddress: 'E-Mail-Adresse',
      password: 'Passwort',
      emailPlaceholder: 'name@gebol.at',
      passwordPlaceholder: '••••••••••••',
      emailRequired: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      passwordRequired: 'Bitte geben Sie Ihr Passwort ein.',
      signInBtn: 'Anmelden',
      signInWithMicrosoft: 'Mit Microsoft anmelden',
      ssoNotice: 'Sichere Einmalanmeldung (SSO) für GEBOL-Unternehmenskonten',
      copyright: 'Alle Rechte vorbehalten',
    },
  },
};
