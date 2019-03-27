package org.drugis.addis.importer;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.http.Header;
import org.drugis.addis.importer.impl.ClinicalTrialsImportError;

public interface ClinicalTrialsImportService {
   JsonNode fetchInfo(String nctId) throws ClinicalTrialsImportError;
   Header importStudy(String commitTitle,
                      String commitDescription,
                      String datasetUuid,
                      String graphUuid, String importStudyRef) throws ClinicalTrialsImportError;
}
