// Reference: javascript_object_storage blueprint
import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
// Admin-only styles: loaded with the uploader, not on the public page.
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

/** The upload window in Georgian, like the rest of the admin. Georgian nouns don't pluralize after numbers. */
const georgian = {
  pluralize: () => 0,
  strings: {
    dropPasteFiles: "ჩააგდეთ ფაილი აქ ან %{browseFiles}",
    browseFiles: "აირჩიეთ ფაილი",
    dropHint: "ჩააგდეთ ფაილი აქ",
    myDevice: "ჩემი მოწყობილობა",
    uploadXFiles: { 0: "ატვირთვა" },
    uploadXNewFiles: { 0: "ატვირთვა" },
    xFilesSelected: { 0: "არჩეულია %{smart_count} ფაილი" },
    uploadingXFiles: { 0: "იტვირთება %{smart_count} ფაილი" },
    processingXFiles: { 0: "მუშავდება %{smart_count} ფაილი" },
    filesUploadedOfTotal: { 0: "აიტვირთა %{complete} / %{smart_count}" },
    youCanOnlyUploadX: { 0: "შეიძლება მხოლოდ %{smart_count} ფაილი" },
    uploading: "იტვირთება",
    complete: "დასრულდა",
    uploadComplete: "ატვირთვა დასრულდა",
    uploadFailed: "ატვირთვა ვერ მოხერხდა",
    retry: "თავიდან ცდა",
    retryUpload: "თავიდან ცდა",
    upload: "ატვირთვა",
    cancel: "გაუქმება",
    cancelUpload: "ატვირთვის გაუქმება",
    done: "მზადაა",
    back: "უკან",
    removeFile: "ფაილის წაშლა",
    addMore: "კიდევ დამატება",
    addMoreFiles: "ფაილების დამატება",
    closeModal: "დახურვა",
    dashboardTitle: "ფაილის ატვირთვა",
    dashboardWindowTitle: "ფაილის ატვირთვა (Esc — დახურვა)",
    dataUploadedOfTotal: "%{complete} / %{total}",
    xTimeLeft: "დარჩა %{time}",
    exceedsSize: "%{file} ძალიან დიდია (მაქს. %{size})",
    youCanOnlyUploadFileTypes: "შეიძლება მხოლოდ: %{types}",
  },
};

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management. Uses XHRUpload instead of AWS S3 for direct local server uploads.
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      locale: georgian,
      restrictions: {
        maxNumberOfFiles,
        maxFileSize: 104857600, // 100MB to allow for videos
        allowedFileTypes: ['image/*', 'video/*'],
      },
      autoProceed: false,
    })
      .use(XHRUpload, {
        endpoint: "/api/objects/upload",
        fieldName: "file",
        formData: true,
        withCredentials: true,
      })
      .on("complete", (result: any) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      {/* type="button": inside a form this must open the uploader, not submit the form */}
      <Button
        type="button"
        onClick={() => {
          // Start each upload fresh: forget the file from the previous one
          if (Object.keys(uppy.getState().currentUploads).length === 0) uppy.clear();
          setShowModal(true);
        }}
        className={buttonClassName}
        data-testid="button-upload-image"
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
