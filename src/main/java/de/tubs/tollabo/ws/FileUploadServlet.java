/**
 * Copyright (c) 2014 Oracle and/or its affiliates. All rights reserved.
 *
 * You may not modify, use, reproduce, or distribute this software except in
 * compliance with the terms of the License at:
 * http://java.net/projects/javaeetutorial/pages/BerkeleyLicense
 */
package de.tubs.tollabo.ws;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import net.coobird.thumbnailator.Thumbnails;

/**
 * File upload servlet example
 */
@WebServlet(name = "FileUploadServlet", urlPatterns = {"/upload"})
@MultipartConfig
public class FileUploadServlet extends HttpServlet {

    private final String UPLOADS_PATH = "/home/glassfish4/glassfish/domains/domain1/applications/tollabo/uploads";
    private final String THUMBNAILS_PATH = "/home/glassfish4/glassfish/domains/domain1/applications/tollabo/uploads/thumbnails";

    private final static Logger LOGGER
            = Logger.getLogger(FileUploadServlet.class.getCanonicalName());
    private static final long serialVersionUID = 7908187011456392847L;

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

    }

    private String getFileName(final Part part) {
        final String partHeader = part.getHeader("content-disposition");
        LOGGER.log(Level.INFO, "Part Header = {0}", partHeader);
        for (String content : part.getHeader("content-disposition").split(";")) {
            if (content.trim().startsWith("filename")) {
                return content.substring(
                        content.indexOf('=') + 1).trim().replace("\"", "");
            }
        }
        return null;
    }

    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);

        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Pragma", "no-cache");
        PrintWriter out = response.getWriter();

        ArrayList<String> filenames = new ArrayList<String>();
        File directory = new File(UPLOADS_PATH);
        File[] list = directory.listFiles();
        if (list != null) {
            for (File file : list) {
                if (!file.isDirectory()) {
                    filenames.add(file.getName());
                }
            }
        }
        out.print(filenames);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);

        response.setContentType("text/html;charset=UTF-8");

        // Create path components to save the file
        final Part filePart = request.getPart("file");
        final String fileName = getFileName(filePart);

        OutputStream out = null;
        InputStream filecontent = null;
        final PrintWriter writer = response.getWriter();

        String testExtension = fileName.substring(fileName.length() - 3, fileName.length());
        if (!testExtension.contains("jpg") && !testExtension.contains("png")) {
            writer.println("Please upload an image file of type *.jpg or *.png <br>");
            writer.println("Your filetype: "+  testExtension + "<br>");
            writer.println("<meta http-equiv=\"refresh\" content=\"5;URL=/tollabo/#gallery\" />");
            writer.println("You are beeing redirect to the main page in five seconds.<br>");
            writer.println("Otherwise, click <a href=\"/tollabo/#gallery\" </a> here <br>");
        } else {

            try {
                out = new FileOutputStream(new File(UPLOADS_PATH + File.separator
                        + fileName));
                filecontent = filePart.getInputStream();

                int read;
                final byte[] bytes = new byte[1024];

                while ((read = filecontent.read(bytes)) != -1) {
                    out.write(bytes, 0, read);
                }

                Thumbnails.of(new File(UPLOADS_PATH + File.separator + fileName))
                        .size(160, 160)
                        .toFile(new File(THUMBNAILS_PATH + File.separator + fileName));

                writer.println("New file " + fileName + " created <br>");
                LOGGER.log(Level.INFO, "File {0} being uploaded to {1}",
                        new Object[]{fileName, UPLOADS_PATH});
                writer.println("<meta http-equiv=\"refresh\" content=\"5;URL=/tollabo/#gallery\" />");
                writer.println("You are beeing redirect to the main page in five seconds.<br>");
                writer.println("Otherwise, click <a href=\"/tollabo/#gallery\" </a> here <br>");

            } catch (FileNotFoundException fne) {
                writer.println("You either did not specify a file to upload or are "
                        + "trying to upload a file to a protected or nonexistent "
                        + "location.");
                writer.println("<br/> ERROR: " + fne.getMessage());

                LOGGER.log(Level.SEVERE, "Problems during file upload. Error: {0}",
                        new Object[]{fne.getMessage()});
            } finally {
                if (out != null) {
                    out.close();
                }
                if (filecontent != null) {
                    filecontent.close();
                }
                if (writer != null) {
                    writer.close();
                }
            }
        }
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Servlet that uploads files to a user-defined destination";
    }
}
