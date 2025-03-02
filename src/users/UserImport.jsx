import { useState } from "react";
import {
  SimpleForm,
  FileInput,
  FileField,
  Button,
  SaveButton,
  useRedirect,
} from "react-admin";
import {
  CircularProgress,
  CssBaseline,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import { UserImportList } from "./UserImportList";
import awsmobile from "../aws-export";
import Papa from "papaparse";

const apiUrl = awsmobile.aws_backend_api_url;

const importUserMaxAmount = 5000;

const UserImport = () => {
  const [userData, setUserData] = useState([]);
  const [errorLog, setErrorLog] = useState([]);
  const [result, setResult] = useState([0, 0, 0]);
  const [importState, setImportState] = useState("init");
  const [checked, setChecked] = useState(true);
  const redirect = useRedirect();
  const handleClick = () => redirect("/users");

  const updateloadCSV = (file) => {
    setImportState("init");

    if (file && file.csvFile) {
      setImportState("parsing");

      let count = 0;
      let validCount = 0;
      Papa.parse(file.csvFile.rawFile, {
        header: true,
        skipEmptyLines: true,
        worker: true, // Don't bog down the main thread if its a big file
        preview: importUserMaxAmount,
        step: function (result) {
          const phoneRegex =
            /^\+?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
          const emailRegex = /^\b[A-Z0-9._+%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

          if (result.data.length === 0) {
            console.log("empty row");
            return;
          }

          count++;

          if (result.data.email && result.data.email.length > 0) {
            result.data.email = result.data.email.trim().toLowerCase();
          }

          // email and group are required
          if (
            result.data.email &&
            result.data.group &&
            result.first_name &&
            result.last_name
          ) {
            result.data.email.match(emailRegex)
              ? console.log("valid email")
              : console.log("invalid email");
            validCount++;
            console.log("valid row");
          }

          if (result.data.phone_number) {
            let phone_number = result.data.phone_number.trim();
            if (phone_number.length > 0 && phone_number[0] === "+") {
              phone_number = phone_number
                .substring(1)
                .replace(/[^0-9a-z]/gi, "");
              result.data.phone_number = "+" + phone_number;
            }
            result.data.phone_number.match(phoneRegex)
              ? console.log("valid phone")
              : console.log("invalid phone");
          }

          if (result.data.group && result.data.group.length > 0) {
            result.data.groups = result.data.group
              .split(",")
              .map(function (item) {
                return item.trim();
              });
          }

          if (result.data.first_name) {
            result.data.given_name = result.data.first_name.trim();
          }
          if (result.data.last_name) {
            result.data.family_name = result.data.last_name.trim();
          }
          if (result.data.middle_name) {
            result.data.middle_name = result.data.middle_name.trim();
          }
          if (result.data.name) {
            result.data.name = result.data.name.trim();
          }
          if (result.data.gender) {
            result.data.gender = result.data.gender.trim().toLowerCase();
          }
          if (result.data.picture) {
            result.data.picture = result.data.picture.trim();
          }
          if (result.data.profile) {
            result.data.profile = result.data.profile.trim();
          }
          if (result.data.birthdate) {
            result.data.birthdate = result.data.birthdate.trim();
          }
          if (result.data['alter-email']) {
            result.data['alter-email'] = result.data['alter-email'].toLowerCase().trim();
          }
          if (result.data['voice-number']) {
            result.data['voice-number'] = result.data['voice-number'].trim();
          }
          if (result.data.locale) {
            result.data.locale = result.data.locale.trim();
          }

          setUserData((userData) => [...userData, result.data]);
        },
        complete: function (results, file) {
          setImportState("csvValid");
          console.log("parsing complete read", count, "records.", results);
        },
      });
    }
  };

  const handleMyImport = async () => {
    const notify = document.getElementById("notify").checked;
    const errorMsg = [];
    let success = 0;
    const pause = () => {
      return new Promise((r) => setTimeout(r, 0));
    };

    setImportState("importing");
    setResult([0, 0, userData.length]);

    for (let i = 0; i < userData.length; i++) {
      const user = userData[i];
      const { groups, email, phone_number, given_name, family_name, ...rest } =
        user;

      const params = {
        groups,
        email,
        phone_number,
        given_name,
        family_name,
        notify,
        ...rest,
      };

      const url = `${apiUrl}/users`;

      // pause for UI update
      if (i % 5 === 0) {
        setResult([success, i + 1, userData.length]);
        await pause();
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          body: JSON.stringify({ data: params }),
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const json = await res.json();
        if (
          res.status !== 200 ||
          json.type === "exception" ||
          json.type === "Error"
        ) {
          console.log("errorMsg", errorMsg);
          errorMsg.push(`${email} - ${json.message}`);
          throw new Error(`${email} - ${json.message}`);
        } else {
          success += 1;
          setResult([success, i + 1, userData.length]);
          console.log("imported data", json.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    }

    // console.log('errorMsg', errorMsg)

    setImportState("importDone");
    setErrorLog(errorMsg);
    setUserData([]);
    setResult([success, userData.length, userData.length]);
  };

  const ImportButton = () => (
    <Button
      label="Import"
      onClick={handleMyImport}
      variant="contained"
      color="primary"
      startIcon={null}
    />
  );

  return (
    <Paper
      elevation={1}
      style={{ margin: "20px", padding: "0px 20px 20px 20px", minHeight: "x" }}
    >
      <CssBaseline />
        <h1> Import Users</h1>
        <h3> {importUserMaxAmount} users per import maximum</h3>
        {importState === "csvValid" && (
          <SimpleForm
            toolbar={
              <>
                <ImportButton />
                <Button
                  label="Cancel"
                  onClick={() => {
                    setUserData([]);
                    setImportState("init");
                  }}
                  color="primary"
                  startIcon={<></>}
                />
              </>
            }
          >
            <UserImportList data={userData} />
            <br />
            <br />
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={checked}
                    id="notify"
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                }
                label="Send an invitation email to user now"
              />
            </FormGroup>
            <br />
          </SimpleForm>
        )}
        {(importState === "importing" || importState === "parsing") && (
          <>
            <CircularProgress sx={{ marginRight: 1 }} size={18} thickness={2} />
            <Typography variant="body2">
              {importState}...{" "}
              {importState === "importing" &&
                `${result[1]} of ${result[2]} Records`}
            </Typography>
            {importState === "importing" && (
              <Typography variant="body2">
                Do not leave this page during import.
              </Typography>
            )}
          </>
        )}
        {importState === "importDone" && (
          <>
            <h3> {`${result[0]} of ${result[2]} Users Imported`} </h3>
            {errorLog.length > 0 && <h4> Issues </h4>}
            <Grid container>
              {errorLog.map((el, idx) => (
                <Grid item xs={5} sm={5} md={5} lg={5}>
                  <Typography variant="body2" color="darkred" key={idx}>
                    {el}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <br />
            <Button
              label="View Users"
              onClick={handleClick}
              variant="contained"
              color="primary"
              startIcon={<></>}
            />
          </>
        )}
        {importState === "init" && (
          <SimpleForm
            onSubmit={updateloadCSV}
            toolbar={<SaveButton label="Load Data" icon={<></>} />}
          >
            <FileInput
              source="csvFile"
              label="Upload file (.csv)"
              accept=".csv"
            >
              <FileField source="src" title="title" />
            </FileInput>
            <br />
            <br />
            <div>
              <a
                href="./example.csv"
                download="example.csv"
                title="example import csv"
                target="_blank"
              >
                Example Import CSV file
              </a>
            </div>
          </SimpleForm>
        )}
    </Paper>
  );
};

export default UserImport;
