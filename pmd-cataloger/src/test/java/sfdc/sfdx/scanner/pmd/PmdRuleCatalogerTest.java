package sfdc.sfdx.scanner.pmd;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.fail;
import static sfdc.sfdx.scanner.TestConstants.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import com.salesforce.messaging.CliMessager;
import com.salesforce.messaging.EventKey;
import com.salesforce.messaging.MessagePassableException;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import sfdc.sfdx.scanner.pmd.catalog.PmdCatalogJson;

/**
 * Unit test for {@link PmdRuleCataloger}
 */
public class PmdRuleCatalogerTest {
	private static final String TEST_CATALOG_DIR = "./test/path/to/a/directory";
	private static final String TEST_CATALOG_FILE = "PmdCatalog.json";

	public ArgumentCaptor<String> jsonContentsCaptor;
	public ArgumentCaptor<Path> directoryPathCaptor;
	public ArgumentCaptor<String> fileNameCaptor;

	@BeforeEach
	public void setup() {
		System.setProperty("catalogHome", TEST_CATALOG_DIR);
		System.setProperty("catalogName", TEST_CATALOG_FILE);
		CliMessager.getInstance().resetMessages();
	}

	@AfterEach
	public void teardown() {
		System.clearProperty("catalogHome");
		System.clearProperty("catalogName");
	}

	public PmdRuleCataloger createPmdRuleCatalogerSpy(Map<String,List<String>> rulePathEntries) {
		PmdRuleCataloger pmdRuleCataloger = new PmdRuleCataloger(rulePathEntries);
		PmdRuleCataloger pmdRuleCatalogerSpy = Mockito.spy(pmdRuleCataloger);

		jsonContentsCaptor = ArgumentCaptor.forClass(String.class);
		directoryPathCaptor = ArgumentCaptor.forClass(Path.class);
		fileNameCaptor = ArgumentCaptor.forClass(String.class);

		Mockito.doNothing().when(pmdRuleCatalogerSpy).persistJsonToFile(jsonContentsCaptor.capture(), directoryPathCaptor.capture(), fileNameCaptor.capture());

		return pmdRuleCatalogerSpy;
	}


    @SuppressWarnings("unchecked")
	@Test
	public void testAddJar() {
		Map<String, List<String>> rulePathEntries = new Hashtable<>();

		rulePathEntries.put(APEX, Collections.singletonList(JAR_FILE_CATEGORIES_AND_RULESETS.toAbsolutePath().toString()));

		PmdRuleCataloger pmdRuleCatalogerSpy = createPmdRuleCatalogerSpy(rulePathEntries);
		pmdRuleCatalogerSpy.catalogRules();

		String catalogJson = jsonContentsCaptor.getValue();
		Path directoryPath = directoryPathCaptor.getValue();
		String fileName = fileNameCaptor.getValue();

		JSONObject json = null;
		try {
			json = (JSONObject) (new JSONParser().parse(catalogJson));
		} catch (ParseException pe) {
			fail("Parse failure " + pe.getMessage());
		}

		List<Object> rulesets = (List<Object>)json.get(PmdCatalogJson.JSON_RULESETS);
		assertNotNull(rulesets);
		assertThat(rulesets, hasSize(equalTo(1)));
		Map<String, Object> ruleset = (Map<String, Object>)rulesets.get(0);
		assertNotNull(ruleset);
		assertThat((List<String>)ruleset.get(PmdCatalogJson.JSON_PATHS), contains("rulesets/apex/rules1.xml"));

		List<Object> categories = (List<Object>)json.get(PmdCatalogJson.JSON_CATEGORIES);
		assertNotNull(categories);
		assertThat(categories, hasSize(equalTo(1)));
		Map<String, Object> category = (Map<String, Object>)categories.get(0);
		assertNotNull(category);
		assertThat((List<String>)category.get(PmdCatalogJson.JSON_PATHS), contains("category/apex/cat1.xml"));

		assertEquals(directoryPath, Paths.get(TEST_CATALOG_DIR));
		assertEquals(fileName, TEST_CATALOG_FILE);
    }

    @SuppressWarnings("unchecked")
	@Test
	public void testAddXml() {
    	String path = SOMECAT_XML_FILE.toAbsolutePath().toString();
		Map<String, List<String>> rulePathEntries = new Hashtable<>();

		rulePathEntries.put(APEX, Collections.singletonList(path));

		PmdRuleCataloger pmdRuleCatalogerSpy = createPmdRuleCatalogerSpy(rulePathEntries);
		pmdRuleCatalogerSpy.catalogRules();

		String catalogJson = jsonContentsCaptor.getValue();
		Path directoryPath = directoryPathCaptor.getValue();
		String fileName = fileNameCaptor.getValue();

		JSONObject json = null;
		try {
			json = (JSONObject) (new JSONParser().parse(catalogJson));
		} catch (ParseException pe) {
			fail("Parse failure " + pe.getMessage());
		}

		List<Object> categories = (List<Object>)json.get(PmdCatalogJson.JSON_CATEGORIES);
		assertNotNull(categories);
		assertThat(categories, hasSize(equalTo(1)));
		Map<String, Object> category = (Map<String, Object>)categories.get(0);
		assertNotNull(category);
		assertThat((List<String>)category.get(PmdCatalogJson.JSON_PATHS), contains(path));

		assertEquals(directoryPath, Paths.get(TEST_CATALOG_DIR));
		assertEquals(fileName, TEST_CATALOG_FILE);
    }

    @Test
	public void testExceptionIsThrownWhenCollisionOccurs() {
		Map<String, List<String>> rulePathEntries = new Hashtable<>();

		rulePathEntries.put(APEX, Arrays.asList(COLLISION_JAR_1.toAbsolutePath().toString(),
				COLLISION_JAR_2.toAbsolutePath().toString()));
		PmdRuleCataloger pmdRuleCataloger = new PmdRuleCataloger(rulePathEntries);

        MessagePassableException ex = assertThrows(MessagePassableException.class,
            () -> pmdRuleCataloger.catalogRules());
        assertThat(ex.getEventKey(), is(EventKey.ERROR_EXTERNAL_DUPLICATE_XML_PATH));
        assertThat(ex.getArgs(), is(new String[] {
            "category/joshapex/somecat.xml",
            COLLISION_JAR_2.toAbsolutePath().toString(),
            COLLISION_JAR_1.toAbsolutePath().toString() }
        ));
	}
}
